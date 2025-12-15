import { PGValidationRepository } from '../../src/repository/impl/pg-validation-repository';
import { ValidationToSave } from '../../src/entities/pr-execution.entity';
import { Context } from '../../src/middleware/context';
import { dataSource } from '../../src/utils/database';
import { PrValidationModel } from '../../src/repository/models/pr-validation.model';

// Mock del datasource
jest.mock('../../src/utils/database', () => ({
    dataSource: {
        getRepository: jest.fn()
    }
}));

// Mock del logger
jest.mock('../../src/utils/logger', () => ({
    getLogger: jest.fn(() => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }))
}));

describe('PGValidationRepository', () => {
    let repository: PGValidationRepository;
    let mockContext: Context;
    let mockRepository: any;
    let mockValidationToSave: ValidationToSave;

    beforeEach(() => {
        jest.clearAllMocks();

        mockContext = {
            applicationId: 'test-app',
            transactionId: 'test-transaction-123'
        };

        mockRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn()
        };

        (dataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

        repository = new PGValidationRepository(mockContext);

        mockValidationToSave = {
            repositoryName: 'org/test-repo',
            publisher: 'testuser',
            originBranch: 'feature-branch',
            targetBranch: 'main',
            prDate: new Date('2024-01-01T10:00:00Z'),
            prNumber: 456
        };
    });

    describe('saveValidation', () => {
        it('debe guardar una validación exitosamente', async () => {
            const mockCreatedValidation: Partial<PrValidationModel> = {
                repository_name: 'org/test-repo',
                publisher: 'testuser',
                origin_branch: 'feature-branch',
                target_branch: 'main',
                pr_number: 456
            };

            const mockSavedValidation: PrValidationModel = {
                ...mockCreatedValidation,
                id: 789
            } as PrValidationModel;

            mockRepository.create.mockReturnValue(mockCreatedValidation);
            mockRepository.save.mockResolvedValue(mockSavedValidation);

            const result = await repository.saveValidation(mockValidationToSave);

            expect(result.success).toBe(true);
            expect(result.id).toBe(789);
            expect(result.message).toBe('Registro de PR validation creado exitosamente');
            expect(mockRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    repository_name: 'org/test-repo',
                    publisher: 'testuser',
                    origin_branch: 'feature-branch',
                    target_branch: 'main',
                    pr_number: 456
                })
            );
            expect(mockRepository.save).toHaveBeenCalledWith(mockCreatedValidation);
        });

        it('debe manejar errores al guardar validación', async () => {
            const error = new Error('Database connection failed');
            mockRepository.create.mockReturnValue({});
            mockRepository.save.mockRejectedValue(error);

            const result = await repository.saveValidation(mockValidationToSave);

            expect(result.success).toBe(false);
            expect(result.message).toContain('Error al crear registro de PR validation');
            expect(result.message).toContain('Database connection failed');
            expect(result.id).toBeUndefined();
        });

        it('debe manejar errores de tipo string', async () => {
            mockRepository.create.mockReturnValue({});
            mockRepository.save.mockRejectedValue('String error');

            const result = await repository.saveValidation(mockValidationToSave);

            expect(result.success).toBe(false);
            expect(result.message).toContain('String error');
        });

        it('debe incluir validation_created_at en los datos guardados', async () => {
            const mockCreatedValidation = { id: 1 };
            mockRepository.create.mockReturnValue(mockCreatedValidation);
            mockRepository.save.mockResolvedValue({ ...mockCreatedValidation, id: 1 });

            await repository.saveValidation(mockValidationToSave);

            expect(mockRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    validation_created_at: expect.any(Date)
                })
            );
        });

        it('debe transformar correctamente todos los campos', async () => {
            const mockCreatedValidation = { id: 1 };
            mockRepository.create.mockReturnValue(mockCreatedValidation);
            mockRepository.save.mockResolvedValue({ ...mockCreatedValidation, id: 1 });

            await repository.saveValidation(mockValidationToSave);

            expect(mockRepository.create).toHaveBeenCalledWith({
                repository_name: 'org/test-repo',
                publisher: 'testuser',
                origin_branch: 'feature-branch',
                target_branch: 'main',
                validation_created_at: expect.any(Date),
                pr_created_at: mockValidationToSave.prDate,
                pr_number: 456
            });
        });
    });
});
