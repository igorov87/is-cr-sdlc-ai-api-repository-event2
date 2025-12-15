import { PrExecutionController } from '../../src/controllers/pr-execution.controller';
import { Request, ResponseToolkit } from '@hapi/hapi';
import { PrExecutionEntity, PullRequest, Repository, User, GitRef } from '../../src/entities/pr-execution.entity';
import { Context, ContextRequestApplicationState } from '../../src/middleware/context';

// Mock del service
jest.mock('../../src/services/pr-execution.service');
jest.mock('../../src/publisher/impl/topic-publisher-pubsub');
jest.mock('../../src/repository/impl/pg-validation-repository');

// Mock del logger
jest.mock('../../src/utils/logger', () => ({
    getLogger: jest.fn(() => ({
        debug: jest.fn(),
        info: jest.fn(),
        trace: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }))
}));

describe('PrExecutionController', () => {
    let controller: PrExecutionController;
    let mockRequest: Partial<Request>;
    let mockH: Partial<ResponseToolkit>;
    let mockContext: Context;
    let mockPayload: PrExecutionEntity;

    beforeEach(() => {
        jest.clearAllMocks();

        controller = new PrExecutionController();

        mockContext = {
            applicationId: 'test-app',
            transactionId: 'test-transaction-123'
        };

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

        mockPayload = {
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

        mockRequest = {
            payload: mockPayload,
            app: {
                context: mockContext
            } as ContextRequestApplicationState
        } as any;

        const mockResponseObject = {
            code: jest.fn().mockReturnThis()
        };

        mockH = {
            response: jest.fn().mockReturnValue(mockResponseObject)
        } as any;
    });

    describe('pullRequestEventHandler', () => {
        it('debe procesar correctamente un PR válido', async () => {
            const { PrExecutionService } = require('../../src/services/pr-execution.service');
            PrExecutionService.mockImplementation(() => ({
                pullRequestEventHandler: jest.fn().mockResolvedValue({
                    success: true,
                    message: 'Validación publicada correctamente',
                    data: { id: 789 }
                })
            }));

            await controller.pullRequestEventHandler(mockRequest as Request, mockH as ResponseToolkit);

            expect(mockH.response).toHaveBeenCalledWith({
                success: true,
                message: 'Validación publicada correctamente'
            });
            const responseObj = (mockH.response as jest.Mock).mock.results[0].value;
            expect(responseObj.code).toHaveBeenCalledWith(201);
        });

        it('debe retornar error 400 cuando no hay payload', async () => {
            const requestWithoutPayload = {
                ...mockRequest,
                payload: null
            } as any;

            await controller.pullRequestEventHandler(requestWithoutPayload as Request, mockH as ResponseToolkit);

            expect(mockH.response).toHaveBeenCalledWith({
                error: 'INVALID_PAYLOAD',
                message: 'El payload es requerido'
            });
            const responseObj = (mockH.response as jest.Mock).mock.results[0].value;
            expect(responseObj.code).toHaveBeenCalledWith(400);
        });

        it('debe manejar errores del servicio correctamente', async () => {
            const { PrExecutionService } = require('../../src/services/pr-execution.service');
            PrExecutionService.mockImplementation(() => ({
                pullRequestEventHandler: jest.fn().mockRejectedValue(new Error('Service error'))
            }));

            await controller.pullRequestEventHandler(mockRequest as Request, mockH as ResponseToolkit);

            expect(mockH.response).toHaveBeenCalledWith({
                error: 'INTERNAL_ERROR',
                message: 'Error interno del servidor'
            });
            const responseObj = (mockH.response as jest.Mock).mock.results[0].value;
            expect(responseObj.code).toHaveBeenCalledWith(500);
        });

        it('debe retornar respuesta exitosa con data cuando el servicio tiene éxito', async () => {
            const { PrExecutionService } = require('../../src/services/pr-execution.service');
            PrExecutionService.mockImplementation(() => ({
                pullRequestEventHandler: jest.fn().mockResolvedValue({
                    success: true,
                    message: 'Operación exitosa',
                    data: { id: 999 }
                })
            }));

            await controller.pullRequestEventHandler(mockRequest as Request, mockH as ResponseToolkit);

            expect(mockH.response).toHaveBeenCalledWith({
                success: true,
                message: 'Operación exitosa'
            });
            const responseObj = (mockH.response as jest.Mock).mock.results[0].value;
            expect(responseObj.code).toHaveBeenCalledWith(201);
        });

        it('debe manejar respuesta fallida del servicio', async () => {
            const { PrExecutionService } = require('../../src/services/pr-execution.service');
            PrExecutionService.mockImplementation(() => ({
                pullRequestEventHandler: jest.fn().mockResolvedValue({
                    success: false,
                    message: 'Acción no válida'
                })
            }));

            await controller.pullRequestEventHandler(mockRequest as Request, mockH as ResponseToolkit);

            expect(mockH.response).toHaveBeenCalledWith({
                success: false,
                message: 'Acción no válida'
            });
            const responseObj = (mockH.response as jest.Mock).mock.results[0].value;
            expect(responseObj.code).toHaveBeenCalledWith(201);
        });

        it('debe usar el contexto de la request correctamente', async () => {
            const { PrExecutionService } = require('../../src/services/pr-execution.service');
            const mockServiceHandler = jest.fn().mockResolvedValue({
                success: true,
                message: 'OK'
            });
            PrExecutionService.mockImplementation(() => ({
                pullRequestEventHandler: mockServiceHandler
            }));

            await controller.pullRequestEventHandler(mockRequest as Request, mockH as ResponseToolkit);

            expect(mockServiceHandler).toHaveBeenCalledWith(mockPayload);
        });

        it('no debe exponer detalles técnicos de errores al cliente', async () => {
            const { PrExecutionService } = require('../../src/services/pr-execution.service');
            PrExecutionService.mockImplementation(() => ({
                pullRequestEventHandler: jest.fn().mockRejectedValue(
                    new Error('Database connection string: user@password:host')
                )
            }));

            await controller.pullRequestEventHandler(mockRequest as Request, mockH as ResponseToolkit);

            const responseCall = (mockH.response as jest.Mock).mock.calls[0][0];
            expect(responseCall.message).toBe('Error interno del servidor');
            expect(responseCall.message).not.toContain('Database connection');
        });
    });
});
