import { ValidationToSave } from "../entities/pr-execution.entity";

export interface DbValidationRepository {
    saveValidation(validation: ValidationToSave): Promise<{ success: boolean, message?: string, id?: number }>;
}