import { Repository } from 'typeorm';
import { ValidationDetailToSaveResult, ValidationItemResult, ValidationToSave, ValidationToSaveDetailResult, ValidationToUpdate } from "../../entities/pr-execution.entity";
import { dataSource } from "../../utils/database";
import { PrValidationModel } from "../models/pr-validation.model";
import { getLogger } from "../../utils/logger";
import { Context } from "../../middleware/context";
import { DbValidationRepository } from '../db-validation-repository';
import { getErrorMessage } from '../../utils/error-handler';

export class PGValidationRepository implements DbValidationRepository {
    private repository: Repository<PrValidationModel>;

    constructor(private readonly ctx: Context) {
        this.repository = dataSource.getRepository(PrValidationModel);
    }

    /**
     * Guarda un registro de validación de PR en la base de datos
     * @param validation - Datos de la validación a guardar
     * @returns Resultado con éxito, mensaje e ID del registro creado
     */
    async saveValidation(validation: ValidationToSave): Promise<{ success: boolean, message?: string, id?: number }> {
        getLogger(this.ctx).info(`Inicio del metodo PGValidationRepository.saveValidation`);
        
        try {
            const modelData: Partial<PrValidationModel> = {
                repository_name: validation.repositoryName,
                publisher: validation.publisher,
                origin_branch: validation.originBranch,
                target_branch: validation.targetBranch,
                validation_created_at: new Date(),
                pr_created_at: validation.prDate,
                pr_number: validation.prNumber
            };

            getLogger(this.ctx).info(`Datos del registro de PR validation: ${JSON.stringify(modelData)}`);

            const prValidation = this.repository.create(modelData);
            const result = await this.repository.save(prValidation);
            getLogger(this.ctx).info(`Resultado de la inserción del registro de PR validation: ${JSON.stringify(result)}`);
            
            return { success: true, message: 'Registro de PR validation creado exitosamente', id: result.id };
        } catch (error: unknown) {
            // Log completo con stack trace para debugging
            getLogger(this.ctx).error({ err: error }, 'Error al crear registro de PR validation');
            
            // Mensaje seguro para retornar
            const errorMessage = getErrorMessage(error);
            return { success: false, message: `Error al crear registro de PR validation: ${errorMessage}` };
        }
    }
}