import { ValidationToSave } from "../entities/pr-execution.entity";
import { PrValidationModel } from "./models/pr-validation.model";

export interface DbValidationRepository {
    saveValidation(validation: ValidationToSave): Promise<{ success: boolean, message?: string, id?: number }>;
    getAllValidations(): Promise<PrValidationModel[]>;
}