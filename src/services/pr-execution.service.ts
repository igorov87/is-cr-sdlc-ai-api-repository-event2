import { PrExecutionEntity, PrExecutionResponse, ValidationResult, ValidationToSave } from "../entities/pr-execution.entity";
import { Context } from "../middleware/context";
import { TopicPublisher } from "../publisher/topic-publisher";
import { DbValidationRepository } from "../repository/db-validation-repository";
import { PGValidationRepository } from "../repository/impl/pg-validation-repository";
import { getLogger } from "../utils/logger";
import * as env from '../utils/environment';
import { DocumentSyncTopicMessage, UpdateTopicMessage, ValidationTopicMessage } from "../entities/topic-message";
import { ServiceMappers } from "../mappers/service-mappers";
import { getErrorMessage } from "../utils/error-handler";

export class PrExecutionService {

    constructor(private topicPublisher: TopicPublisher, private ctx: Context, private dbValidationRepository: DbValidationRepository) {
    }

    /**
     * Maneja eventos de Pull Request para validación o actualización
     * @param ctx - Contexto de la aplicación para trazabilidad
     * @param prExecutionData - Datos del evento de Pull Request de GitHub
     * @returns Resultado de la ejecución con éxito y mensaje descriptivo
     */
    async pullRequestEventHandler(prExecutionData: PrExecutionEntity): Promise<PrExecutionResponse> {
        getLogger(this.ctx).debug(`Inicio del metodo PrExecutionService.pullRequestEventHandler`);

        try {
            const action = prExecutionData.action;
            const targetBranch = prExecutionData.pull_request.base.ref;
            const targetBranches = env.TARGET_BRANCHES.split('|').map(branch => branch.trim().toLowerCase()) || [];

            const targetCompliance = targetBranches.some((branch: string) => targetBranch.startsWith(branch));
            getLogger(this.ctx).info(`Target Branches: ${targetBranches}`);
            getLogger(this.ctx).info(`Target Branch: ${targetBranch}`);
            getLogger(this.ctx).info(`Target Compliance: ${targetCompliance}`);

            let response: PrExecutionResponse = {
                success: false,
                message: ""
            } as PrExecutionResponse;

            switch (action) {
                case 'opened':
                case 'synchronize':
                    getLogger(this.ctx).info(`Opción de validación: ${action}`);
                    if (targetCompliance) {
                        const actionResult = await this.validationAction(prExecutionData);
                        response.success = actionResult.success;
                        response.message = actionResult.success ? "Validación publicada correctamente" : "Error al publicar la validación";
                        response.data = {
                            id: actionResult.id ?? 0
                        };
                    }
                    else {
                        response.success = false;
                        response.message = `Acción no válida: ${action} para el branch ${targetBranch}`;
                    }
                    break;
                case 'closed':
                    getLogger(this.ctx).info(`Opción de actualización: ${action}`);
                    if (targetCompliance) {
                        const actionResult = await this.updateAction(prExecutionData);
                        response.success = actionResult;
                        response.message = actionResult? "Actualización publicada correctamente" : "Error al publicar la actualización";
                    }
                    else {
                        response.success = false;
                        response.message = `Acción no válida: ${action} para el branch ${targetBranch}`;
                    }
                    break;
                default:
                    response.success = false;
                    response.message = `Acción no válida: ${action}`;
            }


            return response;
        } catch (error: unknown) {
            // Log completo con stack trace para debugging
            getLogger(this.ctx).error({ err: error }, 'Error al crear la ejecución de la PR');
            
            return {
                success: false,
                message: 'Error al procesar el evento de Pull Request'
            } as PrExecutionResponse;
        }
    }

    /**
     * Ejecuta la acción de validación para un Pull Request abierto o sincronizado
     * @param prExecutionData - Datos del evento de Pull Request
     * @returns Resultado con éxito e ID de validación generado
     */
    private async validationAction(prExecutionData: PrExecutionEntity): Promise<{ success: boolean, id?: number }> {
        try {
            const validationToSave: ValidationToSave = ServiceMappers.toValidationToSave(prExecutionData);
            const resultInsert = await this.dbValidationRepository.saveValidation(validationToSave);
            getLogger(this.ctx).info(`Resultado de la inserción de la validación: ${JSON.stringify(resultInsert)}`);

            if (!resultInsert.success || !resultInsert.id) {
                return { success: false, id: undefined };
            }

            const validationMessage: ValidationTopicMessage =  ServiceMappers.toValidationTopicMessage(prExecutionData, resultInsert.id);

            getLogger(this.ctx).info(`Enviando mensaje al topic de validación`);
            const resultPublish = await this.topicPublisher.publishValidationMessage(validationMessage);
            getLogger(this.ctx).info(`Resultado de la publicación del mensaje de validación: ${resultPublish}`);
            return { success: resultPublish, id: resultInsert.id ? resultInsert.id : undefined };
        } catch (error: unknown) {
            // Log completo con stack trace para debugging
            getLogger(this.ctx).error({ err: error }, 'Error al publicar el mensaje de validación');
            
            return { success: false, id: undefined };
        }
    }

    /**
     * Ejecuta la acción de actualización cuando un Pull Request es cerrado
     * @param prExecutionData - Datos del evento de Pull Request
     * @returns True si la actualización fue exitosa, false en caso contrario
     */
    private async updateAction(prExecutionData: PrExecutionEntity): Promise<boolean> {
        try {
            const updateMessage: UpdateTopicMessage = ServiceMappers.toUpdateTopicMessage(prExecutionData);

            if (prExecutionData.pull_request.base.ref === 'main' && updateMessage.merged) {
                getLogger(this.ctx).info(`Sincronizando documentación del PR ${updateMessage.prNumber}...`);
                const documentSyncMessage: DocumentSyncTopicMessage = ServiceMappers.toDocumentSyncTopicMessage(prExecutionData);
                getLogger(this.ctx).info(`Enviando mensaje al topic de sincronización de documentación`);
                const resultPublish = await this.topicPublisher.publishDocumentSyncMessage(documentSyncMessage);
                getLogger(this.ctx).info(`Resultado de la publicación del mensaje de sincronización de documentación: ${resultPublish}`);
            }

            getLogger(this.ctx).info(`Enviando mensaje al topic de actualización`);
            const resultPublish = await this.topicPublisher.publishUpdateMessage(updateMessage);
            getLogger(this.ctx).info(`Resultado de la publicación del mensaje de actualización: ${resultPublish}`);
            return resultPublish;
        } catch (error: unknown) {
            // Log completo con stack trace para debugging
            getLogger(this.ctx).error({ err: error }, 'Error al publicar el mensaje de actualización');
            
            return false;
        }
    }
}