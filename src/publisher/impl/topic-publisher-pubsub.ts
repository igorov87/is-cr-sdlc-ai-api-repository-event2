import { PubSub } from '@google-cloud/pubsub';
import { UpdateTopicMessage, ValidationTopicMessage, DocumentSyncTopicMessage } from "../../entities/topic-message";
import { TopicPublisher } from "../topic-publisher";
import { GCP_PROJECT_ID, PUBSUB_VALIDATION_TOPIC, PUBSUB_UPDATE_TOPIC, PUBSUB_DOCUMENT_SYNC_TOPIC } from '../../utils/environment';
import { Context } from '../../middleware/context';
import { getLogger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/error-handler';

export class TopicPublisherPubSub implements TopicPublisher {
    private pubSubClient: PubSub;

    constructor(private readonly ctx: Context) {
        this.pubSubClient = new PubSub({ projectId: GCP_PROJECT_ID });
    }

    /**
     * Publica mensaje de validación en topic de Google Pub/Sub
     * @param message - Mensaje de validación a publicar
     * @returns True si la publicación fue exitosa
     * @throws Error si falla la publicación
     */
    async publishValidationMessage(message: ValidationTopicMessage): Promise<boolean> {
        getLogger(this.ctx).info(`Inicio del metodo TopicPublisherPubSub.publishValidationMessage`);
        getLogger(this.ctx).debug(`Message: ${JSON.stringify(message)}`);
        try {
            getLogger(this.ctx).debug(`publishValidationMessage - Publicando mensaje de validación para PR: ${message.prNumber}`);
            
            const messageBuffer = Buffer.from(JSON.stringify(message));
            const attributes = {
                TransactionId: this.ctx.transactionId,
                ApplicationId: this.ctx.applicationId,
            };
            const messageId = await this.pubSubClient
                .topic(PUBSUB_VALIDATION_TOPIC)
                .publishMessage({ data: messageBuffer, attributes });
            
            getLogger(this.ctx).info(`Mensaje de validación publicado exitosamente con ID: ${messageId}`);
            return true;
        } catch (error: unknown) {
            // Log completo con stack trace para debugging
            getLogger(this.ctx).error({ err: error }, 'Error al publicar mensaje de validación');
            
            // Mensaje de error para throw
            const errorMessage = getErrorMessage(error);
            throw new Error(`Error al publicar el mensaje de validación: ${errorMessage}`);
        }
    }

    /**
     * Publica mensaje de actualización en topic de Google Pub/Sub
     * @param message - Mensaje de actualización a publicar
     * @returns True si la publicación fue exitosa
     * @throws Error si falla la publicación
     */
    async publishUpdateMessage(message: UpdateTopicMessage): Promise<boolean> {
        getLogger(this.ctx).info(`Inicio del metodo TopicPublisherPubSub.publishUpdateMessage`);
        getLogger(this.ctx).debug(`Message: ${JSON.stringify(message)}`);
        try {
            getLogger(this.ctx).debug(`publishUpdateMessage - Publicando mensaje de actualización para PR: ${message.prNumber}`);
            
            const messageBuffer = Buffer.from(JSON.stringify(message));
            const attributes = {
                TransactionId: this.ctx.transactionId,
                ApplicationId: this.ctx.applicationId,
            };
            const messageId = await this.pubSubClient
                .topic(PUBSUB_UPDATE_TOPIC)
                .publishMessage({ data: messageBuffer, attributes });
            
            getLogger(this.ctx).info(`Mensaje de actualización publicado exitosamente con ID: ${messageId}`);
            return true;
        } catch (error: unknown) {
            // Log completo con stack trace para debugging
            getLogger(this.ctx).error({ err: error }, 'Error al publicar mensaje de actualización');
            
            // Mensaje de error para throw
            const errorMessage = getErrorMessage(error);
            throw new Error(`Error al publicar el mensaje de actualización: ${errorMessage}`);
        }
    }

    /**
     * Publica mensaje de sincronización de documentación en topic de Google Pub/Sub
     * @param message - Mensaje de sincronización a publicar
     * @returns True si la publicación fue exitosa
     * @throws Error si falla la publicación
     */
    async publishDocumentSyncMessage(message: DocumentSyncTopicMessage): Promise<boolean> {
        getLogger(this.ctx).info(`Inicio del metodo TopicPublisherPubSub.publishDocumentSyncMessage`);
        getLogger(this.ctx).debug(`Message: ${JSON.stringify(message)}`);
        try {
            getLogger(this.ctx).debug(`publishDocumentSyncMessage - Publicando mensaje de sincronización para repositorio: ${message.repositoryName}`);
            
            const messageBuffer = Buffer.from(JSON.stringify(message));
            const attributes = {
                TransactionId: this.ctx.transactionId,
                ApplicationId: this.ctx.applicationId,
            };
            const messageId = await this.pubSubClient
                .topic(PUBSUB_DOCUMENT_SYNC_TOPIC)
                .publishMessage({ data: messageBuffer, attributes });
            
            getLogger(this.ctx).info(`Mensaje de sincronización de documentos publicado exitosamente con ID: ${messageId}`);
            return true;
        } catch (error: unknown) {
            // Log completo con stack trace para debugging
            getLogger(this.ctx).error({ err: error }, 'Error al publicar mensaje de sincronización de documentos');
            
            // Mensaje de error para throw
            const errorMessage = getErrorMessage(error);
            throw new Error(`Error al publicar el mensaje de sincronización de documentos: ${errorMessage}`);
        }
    }
}