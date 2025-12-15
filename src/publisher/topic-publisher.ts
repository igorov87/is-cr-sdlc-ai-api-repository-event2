import { DocumentSyncTopicMessage, UpdateTopicMessage, ValidationTopicMessage } from "../entities/topic-message";

export interface TopicPublisher {
    publishValidationMessage(message: ValidationTopicMessage): Promise<boolean>;
    publishUpdateMessage(message: UpdateTopicMessage): Promise<boolean>;
    publishDocumentSyncMessage(message: DocumentSyncTopicMessage): Promise<boolean>;
}