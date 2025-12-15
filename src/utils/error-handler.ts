/**
 * Utilidades para manejo seguro de errores con TypeScript
 */

/**
 * Extrae el mensaje de error de forma segura desde cualquier tipo de error
 * @param error - Error desconocido capturado en catch
 * @returns Mensaje de error en formato string
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    
    if (typeof error === 'string') {
        return error;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    
    return 'Error desconocido';
}

/**
 * Type guard para verificar si un error es instancia de Error
 * @param error - Error desconocido a verificar
 * @returns True si el error es instancia de Error
 */
export function isError(error: unknown): error is Error {
    return error instanceof Error;
}

/**
 * Obtiene el stack trace de un error si está disponible
 * @param error - Error desconocido
 * @returns Stack trace o undefined
 */
export function getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error) {
        return error.stack;
    }
    return undefined;
}
