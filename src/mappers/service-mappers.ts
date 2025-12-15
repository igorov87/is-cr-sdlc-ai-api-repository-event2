import { PrExecutionEntity, ValidationToSave } from "../entities/pr-execution.entity";
import { DocumentSyncTopicMessage, UpdateTopicMessage, ValidationTopicMessage } from "../entities/topic-message";

export class ServiceMappers {
    /**
     * Transforma datos de PR a objeto ValidationToSave para persistencia
     * @param prExecutionData - Datos del evento de Pull Request de GitHub
     * @returns Objeto con datos de validación para guardar en base de datos
     */
    static toValidationToSave(prExecutionData: PrExecutionEntity): ValidationToSave {
        const validationToSave: ValidationToSave = {
            repositoryName: prExecutionData.repository.full_name,
            publisher: prExecutionData.pull_request.user.login,
            originBranch: prExecutionData.pull_request.head.ref,
            targetBranch: prExecutionData.pull_request.base.ref,
            prDate: new Date(prExecutionData.pull_request.created_at),
            prNumber: prExecutionData.pull_request.number,
        } as ValidationToSave;
        return validationToSave;
    }

    /**
     * Transforma datos de PR a mensaje de validación para topic Pub/Sub
     * @param prExecutionData - Datos del evento de Pull Request de GitHub
     * @param prValidationId - ID de la validación creada en base de datos
     * @returns Mensaje de validación para publicar en topic
     */
    static toValidationTopicMessage(prExecutionData: PrExecutionEntity, prValidationId: number): ValidationTopicMessage {
        const validationTopicMessage: ValidationTopicMessage = {
            repoUrl: prExecutionData.repository.clone_url,
            branch: prExecutionData.pull_request.head.ref,
            targetBranch: prExecutionData.pull_request.base.ref,
            prNumber: prExecutionData.pull_request.number,
            githubRepositoryName: prExecutionData.repository.full_name,
            prHeadSha: prExecutionData.pull_request.head.sha,
            prBaseSha: prExecutionData.pull_request.base.sha,
            prUser: prExecutionData.pull_request.user.login,
            repoName: prExecutionData.repository.name,
            repoOwner: prExecutionData.repository.owner.login,
            prValidationId: prValidationId,
        } as ValidationTopicMessage;
        return validationTopicMessage;
    }

    /**
     * Transforma datos de PR cerrado a mensaje de actualización para topic Pub/Sub
     * @param prExecutionData - Datos del evento de Pull Request de GitHub
     * @returns Mensaje de actualización para publicar en topic
     */
    static toUpdateTopicMessage(prExecutionData: PrExecutionEntity): UpdateTopicMessage {
        const updateTopicMessage: UpdateTopicMessage = {
            prNumber: prExecutionData.pull_request.number,
            githubRepositoryFullName: prExecutionData.repository.full_name,
            merged: prExecutionData.pull_request.merged,
            reviewedAt: prExecutionData.pull_request.merged_at,
            reviewer: prExecutionData.pull_request.user.login,
            repositoryUrl: prExecutionData.repository.clone_url,
        } as UpdateTopicMessage;
        return updateTopicMessage;
    }

    /**
     * Transforma datos de PR a mensaje de sincronización de documentación
     * @param prExecutionData - Datos del evento de Pull Request de GitHub
     * @returns Mensaje de sincronización para publicar en topic
     */
    static toDocumentSyncTopicMessage(prExecutionData: PrExecutionEntity): DocumentSyncTopicMessage {
        const documentSyncTopicMessage: DocumentSyncTopicMessage = {
            repositoryUrl: prExecutionData.repository.clone_url,
            githubRepositoryFullName: prExecutionData.repository.full_name,
            repositoryName: prExecutionData.repository.name,
            prNumber: prExecutionData.pull_request.number,
        } as DocumentSyncTopicMessage;
        return documentSyncTopicMessage;
    }
}