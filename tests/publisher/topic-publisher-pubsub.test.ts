import { TopicPublisherPubSub } from '../../src/publisher/impl/topic-publisher-pubsub';
import { ValidationTopicMessage, UpdateTopicMessage, DocumentSyncTopicMessage } from '../../src/entities/topic-message';
import { Context } from '../../src/middleware/context';

// Mock de @google-cloud/pubsub
jest.mock('@google-cloud/pubsub', () => {
    return {
        PubSub: jest.fn().mockImplementation(() => {
            return {
                topic: jest.fn().mockReturnValue({
                    publishMessage: jest.fn().mockResolvedValue('mock-message-id-12345')
                })
            };
        })
    };
});

// Mock del logger
jest.mock('../../src/utils/logger', () => ({
    getLogger: jest.fn(() => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }))
}));

describe('TopicPublisherPubSub', () => {
    let publisher: TopicPublisherPubSub;
    let mockContext: Context;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockContext = {
            applicationId: 'test-app',
            transactionId: 'test-transaction-123'
        };
        
        publisher = new TopicPublisherPubSub(mockContext);
    });

    describe('publishValidationMessage', () => {
        it('debe publicar un mensaje de validación exitosamente', async () => {
            const message: ValidationTopicMessage = {
                repoUrl: 'https://github.com/test/repo',
                branch: 'test',
                prNumber: 123,
                githubRepositoryName: 'test-repo',
                prHeadSha: 'abc123',
                prBaseSha: 'def456',
                prUser: 'testuser',
                repoName: 'repo',
                prValidationId: 1,
                targetBranch: 'main'
            };

            const result = await publisher.publishValidationMessage(message);

            expect(result).toBe(true);
        });

        it('debe lanzar un error cuando falla la publicación del mensaje de validación', async () => {
            const { PubSub } = require('@google-cloud/pubsub');
            PubSub.mockImplementationOnce(() => {
                return {
                    topic: jest.fn().mockReturnValue({
                        publishMessage: jest.fn().mockRejectedValue(new Error('Pub/Sub error'))
                    })
                };
            });

            publisher = new TopicPublisherPubSub(mockContext);

            const message: ValidationTopicMessage = {
                repoUrl: 'https://github.com/test/repo',
                branch: 'test',
                targetBranch: 'main',
                prNumber: 123,
                githubRepositoryName: 'test-repo',
                prHeadSha: 'abc123',
                prBaseSha: 'def456',
                prUser: 'testuser',
                repoName: 'repo',
                prValidationId: 1
            };

            await expect(publisher.publishValidationMessage(message))
                .rejects
                .toThrow('Error al publicar el mensaje de validación');
        });
    });

    describe('publishUpdateMessage', () => {
        it('debe publicar un mensaje de actualización exitosamente', async () => {
            const message: UpdateTopicMessage = {
                prNumber: 456,
                githubRepositoryFullName: 'org/repo',
                merged: true,
                reviewedAt: '2024-01-01T10:00:00Z',
                reviewer: 'reviewer1',
                repositoryUrl: 'https://github.com/org/repo'
            };

            const result = await publisher.publishUpdateMessage(message);

            expect(result).toBe(true);
        });

        it('debe lanzar un error cuando falla la publicación del mensaje de actualización', async () => {
            const { PubSub } = require('@google-cloud/pubsub');
            PubSub.mockImplementationOnce(() => {
                return {
                    topic: jest.fn().mockReturnValue({
                        publishMessage: jest.fn().mockRejectedValue(new Error('Pub/Sub error'))
                    })
                };
            });

            publisher = new TopicPublisherPubSub(mockContext);

            const message: UpdateTopicMessage = {
                prNumber: 456,
                githubRepositoryFullName: 'org/repo',
                merged: true,
                reviewedAt: '2024-01-01T10:00:00Z',
                reviewer: 'reviewer1',
                repositoryUrl: 'https://github.com/org/repo'
            };

            await expect(publisher.publishUpdateMessage(message))
                .rejects
                .toThrow('Error al publicar el mensaje de actualización');
        });
    });

    describe('publishDocumentSyncMessage', () => {
        it('debe publicar un mensaje de sincronización de documentos exitosamente', async () => {
            const message: DocumentSyncTopicMessage = {
                repositoryUrl: 'https://github.com/org/repo',
                githubRepositoryFullName: 'org/repo',
                repositoryName: 'repo',
                prNumber: 456
            };

            const result = await publisher.publishDocumentSyncMessage(message);

            expect(result).toBe(true);
        });

        it('debe lanzar un error cuando falla la publicación del mensaje de sincronización', async () => {
            const { PubSub } = require('@google-cloud/pubsub');
            PubSub.mockImplementationOnce(() => {
                return {
                    topic: jest.fn().mockReturnValue({
                        publishMessage: jest.fn().mockRejectedValue(new Error('Pub/Sub error'))
                    })
                };
            });

            publisher = new TopicPublisherPubSub(mockContext);

            const message: DocumentSyncTopicMessage = {
                repositoryUrl: 'https://github.com/org/repo',
                githubRepositoryFullName: 'org/repo',
                repositoryName: 'repo',
                prNumber: 456
            };

            await expect(publisher.publishDocumentSyncMessage(message))
                .rejects
                .toThrow('Error al publicar el mensaje de sincronización de documentos');
        });
    });

    describe('Validación de formato JSON', () => {
        it('debe serializar correctamente el mensaje ValidationTopicMessage a JSON', async () => {
            const message: ValidationTopicMessage = {
                repoUrl: 'https://github.com/test/repo',
                branch: 'develop',
                targetBranch: 'main',
                prNumber: 789,
                githubRepositoryName: 'test-repo',
                prHeadSha: 'head123',
                prBaseSha: 'base456',
                prUser: 'testuser',
                repoName: 'repo',
                prValidationId: 10
            };

            const jsonString = JSON.stringify(message);
            const parsedMessage = JSON.parse(jsonString);

            expect(parsedMessage).toEqual(message);
            expect(parsedMessage.prNumber).toBe(789);
            expect(parsedMessage.branch).toBe('develop');
        });

        it('debe serializar correctamente el mensaje UpdateTopicMessage a JSON', async () => {
            const message: UpdateTopicMessage = {
                prNumber: 999,
                githubRepositoryFullName: 'myorg/myrepo',
                merged: false,
                reviewedAt: null,
                reviewer: 'reviewer2',
                repositoryUrl: 'https://github.com/myorg/myrepo'
            };

            const jsonString = JSON.stringify(message);
            const parsedMessage = JSON.parse(jsonString);

            expect(parsedMessage).toEqual(message);
            expect(parsedMessage.merged).toBe(false);
            expect(parsedMessage.reviewedAt).toBeNull();
        });

        it('debe serializar correctamente el mensaje DocumentSyncTopicMessage a JSON', async () => {
            const message: DocumentSyncTopicMessage = {
                repositoryUrl: 'https://github.com/sync/repo',
                githubRepositoryFullName: 'sync/repo',
                repositoryName: 'repo-sync',
                prNumber: 789
            };

            const jsonString = JSON.stringify(message);
            const parsedMessage = JSON.parse(jsonString);

            expect(parsedMessage).toEqual(message);
            expect(parsedMessage.repositoryName).toBe('repo-sync');
        });
    });
});

