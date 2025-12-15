import { PrExecutionService } from '../../src/services/pr-execution.service';
import { PrExecutionEntity, PullRequest, Repository, User, GitRef } from '../../src/entities/pr-execution.entity';
import { Context } from '../../src/middleware/context';
import { TopicPublisher } from '../../src/publisher/topic-publisher';
import { DbValidationRepository } from '../../src/repository/db-validation-repository';

// Mock del logger
jest.mock('../../src/utils/logger', () => ({
    getLogger: jest.fn(() => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }))
}));

// Mock de environment
jest.mock('../../src/utils/environment', () => ({
    TARGET_BRANCHES: 'dev|test|main'
}));

describe('PrExecutionService', () => {
    let service: PrExecutionService;
    let mockContext: Context;
    let mockTopicPublisher: jest.Mocked<TopicPublisher>;
    let mockDbValidationRepository: jest.Mocked<DbValidationRepository>;
    let mockPrExecutionData: PrExecutionEntity;

    beforeEach(() => {
        jest.clearAllMocks();

        mockContext = {
            applicationId: 'test-app',
            transactionId: 'test-transaction-123'
        };

        mockTopicPublisher = {
            publishValidationMessage: jest.fn(),
            publishUpdateMessage: jest.fn(),
            publishDocumentSyncMessage: jest.fn()
        };

        mockDbValidationRepository = {
            saveValidation: jest.fn()
        };

        service = new PrExecutionService(
            mockTopicPublisher,
            mockContext,
            mockDbValidationRepository
        );

        const mockUser: User = {
            login: 'testuser',
            id: 1
        } as User;

        const mockRepository: Repository = {
            id: 123,
            name: 'test-repo',
            full_name: 'org/test-repo',
            clone_url: 'https://github.com/org/test-repo.git'
        } as Repository;

        const mockGitRef: GitRef = {
            ref: 'feature-branch',
            sha: 'abc123'
        } as GitRef;

        mockPrExecutionData = {
            action: 'opened',
            number: 456,
            pull_request: {
                number: 456,
                user: mockUser,
                created_at: '2024-01-01T10:00:00Z',
                merged: false,
                merged_at: null,
                head: { ...mockGitRef, ref: 'feature-branch', sha: 'abc123' },
                base: { ...mockGitRef, ref: 'dev', sha: 'def456' }
            } as PullRequest,
            repository: mockRepository,
            sender: mockUser
        };
    });

    describe('pullRequestEventHandler', () => {
        describe('acción opened', () => {
            it('debe procesar correctamente un PR opened en branch dev', async () => {
                mockDbValidationRepository.saveValidation.mockResolvedValue({
                    success: true,
                    id: 789,
                    message: 'Guardado exitosamente'
                });
                mockTopicPublisher.publishValidationMessage.mockResolvedValue(true);

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(true);
                expect(result.message).toBe('Validación publicada correctamente');
                expect(result.data?.id).toBe(789);
                expect(mockDbValidationRepository.saveValidation).toHaveBeenCalled();
                expect(mockTopicPublisher.publishValidationMessage).toHaveBeenCalled();
            });

            it('debe rechazar PR opened en branch no válido', async () => {
                mockPrExecutionData.pull_request.base.ref = 'feature';

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(false);
                expect(result.message).toContain('Acción no válida');
                expect(mockDbValidationRepository.saveValidation).not.toHaveBeenCalled();
            });

            it('debe manejar error al guardar validación', async () => {
                mockDbValidationRepository.saveValidation.mockResolvedValue({
                    success: false,
                    message: 'Error al guardar'
                });

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(false);
                expect(result.message).toBe('Error al publicar la validación');
                expect(mockTopicPublisher.publishValidationMessage).not.toHaveBeenCalled();
            });
        });

        describe('acción synchronize', () => {
            it('debe procesar correctamente un PR synchronize', async () => {
                mockPrExecutionData.action = 'synchronize';
                mockDbValidationRepository.saveValidation.mockResolvedValue({
                    success: true,
                    id: 789
                });
                mockTopicPublisher.publishValidationMessage.mockResolvedValue(true);

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(true);
                expect(result.message).toBe('Validación publicada correctamente');
                expect(mockDbValidationRepository.saveValidation).toHaveBeenCalled();
            });
        });

        describe('acción closed', () => {
            beforeEach(() => {
                mockPrExecutionData.action = 'closed';
            });

            it('debe procesar correctamente un PR closed y merged', async () => {
                mockPrExecutionData.pull_request.merged = true;
                mockPrExecutionData.pull_request.merged_at = '2024-01-01T12:00:00Z';
                mockTopicPublisher.publishUpdateMessage.mockResolvedValue(true);

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(true);
                expect(result.message).toBe('Actualización publicada correctamente');
                expect(mockTopicPublisher.publishUpdateMessage).toHaveBeenCalled();
            });

            it('debe sincronizar documentación cuando PR merged a main', async () => {
                mockPrExecutionData.pull_request.base.ref = 'main';
                mockPrExecutionData.pull_request.merged = true;
                mockPrExecutionData.pull_request.merged_at = '2024-01-01T12:00:00Z';
                mockTopicPublisher.publishUpdateMessage.mockResolvedValue(true);
                mockTopicPublisher.publishDocumentSyncMessage.mockResolvedValue(true);

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(true);
                expect(mockTopicPublisher.publishDocumentSyncMessage).toHaveBeenCalled();
                expect(mockTopicPublisher.publishUpdateMessage).toHaveBeenCalled();
            });

            it('no debe sincronizar documentación si no está merged', async () => {
                mockPrExecutionData.pull_request.base.ref = 'main';
                mockPrExecutionData.pull_request.merged = false;
                mockTopicPublisher.publishUpdateMessage.mockResolvedValue(true);

                await service.pullRequestEventHandler(mockPrExecutionData);

                expect(mockTopicPublisher.publishDocumentSyncMessage).not.toHaveBeenCalled();
            });

            it('debe manejar error al publicar actualización', async () => {
                mockTopicPublisher.publishUpdateMessage.mockResolvedValue(false);

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(false);
                expect(result.message).toBe('Error al publicar la actualización');
            });
        });

        describe('acciones no válidas', () => {
            it('debe rechazar acción no reconocida', async () => {
                mockPrExecutionData.action = 'edited';

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(false);
                expect(result.message).toContain('Acción no válida');
            });
        });

        describe('manejo de errores', () => {
            it('debe manejar excepciones inesperadas', async () => {
                mockDbValidationRepository.saveValidation.mockRejectedValue(
                    new Error('Database error')
                );

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(false);
                expect(result.message).toContain('Error');
            });
        });

        describe('validación de branches objetivo', () => {
            it('debe aceptar branch que empieza con dev', async () => {
                mockPrExecutionData.pull_request.base.ref = 'dev-feature';
                mockDbValidationRepository.saveValidation.mockResolvedValue({
                    success: true,
                    id: 1
                });
                mockTopicPublisher.publishValidationMessage.mockResolvedValue(true);

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(true);
            });

            it('debe aceptar branch test', async () => {
                mockPrExecutionData.pull_request.base.ref = 'test';
                mockDbValidationRepository.saveValidation.mockResolvedValue({
                    success: true,
                    id: 1
                });
                mockTopicPublisher.publishValidationMessage.mockResolvedValue(true);

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(true);
            });

            it('debe aceptar branch main', async () => {
                mockPrExecutionData.pull_request.base.ref = 'main';
                mockDbValidationRepository.saveValidation.mockResolvedValue({
                    success: true,
                    id: 1
                });
                mockTopicPublisher.publishValidationMessage.mockResolvedValue(true);

                const result = await service.pullRequestEventHandler(mockPrExecutionData);

                expect(result.success).toBe(true);
            });
        });
    });
});
