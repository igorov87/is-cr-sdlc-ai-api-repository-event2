import { getErrorMessage, isError, getErrorStack } from '../../src/utils/error-handler';

describe('Error Handler Utils', () => {
    describe('getErrorMessage', () => {
        it('debe extraer mensaje de Error estándar', () => {
            const error = new Error('Test error message');
            const result = getErrorMessage(error);
            
            expect(result).toBe('Test error message');
        });

        it('debe manejar string directamente', () => {
            const error = 'String error';
            const result = getErrorMessage(error);
            
            expect(result).toBe('String error');
        });

        it('debe manejar objeto con propiedad message', () => {
            const error = { message: 'Custom error message' };
            const result = getErrorMessage(error);
            
            expect(result).toBe('Custom error message');
        });

        it('debe retornar "Error desconocido" para null', () => {
            const result = getErrorMessage(null);
            
            expect(result).toBe('Error desconocido');
        });

        it('debe retornar "Error desconocido" para undefined', () => {
            const result = getErrorMessage(undefined);
            
            expect(result).toBe('Error desconocido');
        });

        it('debe retornar "Error desconocido" para número', () => {
            const result = getErrorMessage(42);
            
            expect(result).toBe('Error desconocido');
        });

        it('debe retornar "Error desconocido" para boolean', () => {
            const result = getErrorMessage(true);
            
            expect(result).toBe('Error desconocido');
        });

        it('debe retornar "Error desconocido" para objeto sin message', () => {
            const result = getErrorMessage({ code: 500 });
            
            expect(result).toBe('Error desconocido');
        });

        it('debe manejar TypeError', () => {
            const error = new TypeError('Type error message');
            const result = getErrorMessage(error);
            
            expect(result).toBe('Type error message');
        });

        it('debe manejar RangeError', () => {
            const error = new RangeError('Range error message');
            const result = getErrorMessage(error);
            
            expect(result).toBe('Range error message');
        });

        it('debe convertir message numérico a string', () => {
            const error = { message: 404 };
            const result = getErrorMessage(error);
            
            expect(result).toBe('404');
        });
    });

    describe('isError', () => {
        it('debe retornar true para Error estándar', () => {
            const error = new Error('Test error');
            
            expect(isError(error)).toBe(true);
        });

        it('debe retornar true para TypeError', () => {
            const error = new TypeError('Type error');
            
            expect(isError(error)).toBe(true);
        });

        it('debe retornar true para RangeError', () => {
            const error = new RangeError('Range error');
            
            expect(isError(error)).toBe(true);
        });

        it('debe retornar false para string', () => {
            expect(isError('error string')).toBe(false);
        });

        it('debe retornar false para objeto con message', () => {
            expect(isError({ message: 'error' })).toBe(false);
        });

        it('debe retornar false para null', () => {
            expect(isError(null)).toBe(false);
        });

        it('debe retornar false para undefined', () => {
            expect(isError(undefined)).toBe(false);
        });

        it('debe retornar false para número', () => {
            expect(isError(42)).toBe(false);
        });

        it('debe permitir acceso a propiedades de Error cuando es true', () => {
            const error: unknown = new Error('Test error');
            
            if (isError(error)) {
                // TypeScript debe permitir acceder a error.message
                expect(error.message).toBe('Test error');
                expect(error.name).toBe('Error');
            }
        });
    });

    describe('getErrorStack', () => {
        it('debe retornar stack trace para Error', () => {
            const error = new Error('Test error');
            const stack = getErrorStack(error);
            
            expect(stack).toBeDefined();
            expect(typeof stack).toBe('string');
            expect(stack).toContain('Error: Test error');
        });

        it('debe retornar undefined para string', () => {
            const stack = getErrorStack('error string');
            
            expect(stack).toBeUndefined();
        });

        it('debe retornar undefined para objeto sin stack', () => {
            const stack = getErrorStack({ message: 'error' });
            
            expect(stack).toBeUndefined();
        });

        it('debe retornar undefined para null', () => {
            const stack = getErrorStack(null);
            
            expect(stack).toBeUndefined();
        });

        it('debe retornar undefined para undefined', () => {
            const stack = getErrorStack(undefined);
            
            expect(stack).toBeUndefined();
        });
    });

    describe('Integración - Casos de uso reales', () => {
        it('debe manejar error de base de datos típico', () => {
            const dbError = new Error('Connection refused: ECONNREFUSED 127.0.0.1:5432');
            
            expect(getErrorMessage(dbError)).toContain('Connection refused');
            expect(isError(dbError)).toBe(true);
            expect(getErrorStack(dbError)).toBeDefined();
        });

        it('debe manejar error de API externa', () => {
            const apiError = { 
                message: 'Request failed with status code 500',
                status: 500,
                data: null
            };
            
            expect(getErrorMessage(apiError)).toBe('Request failed with status code 500');
            expect(isError(apiError)).toBe(false);
        });

        it('debe manejar error de validación', () => {
            const validationError = new TypeError('Expected string, received number');
            
            expect(getErrorMessage(validationError)).toBe('Expected string, received number');
            expect(isError(validationError)).toBe(true);
        });
    });
});
