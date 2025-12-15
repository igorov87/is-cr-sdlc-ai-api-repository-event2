import { Request, ResponseToolkit } from '@hapi/hapi';
import { PrExecutionEntity } from '../entities/pr-execution.entity';
import { Context, ContextRequestApplicationState } from '../middleware/context';
import { getLogger } from '../utils/logger';
import { PrExecutionService } from '../services/pr-execution.service';
import { TopicPublisherPubSub } from '../publisher/impl/topic-publisher-pubsub';
import { PGValidationRepository } from '../repository/impl/pg-validation-repository';
import { getErrorMessage } from '../utils/error-handler';

export class PrExecutionController {
  private service: PrExecutionService;

  /**
   * Crea un nuevo registro de ejecución de PR
   * @param request - Solicitud HTTP
   * @param h - ResponseToolkit
   * @returns Response
   */
  async pullRequestEventHandler(request: Request, h: ResponseToolkit) {
    const ctx = this.getContext(request);
    getLogger(ctx).debug(`Inicio del metodo PrExecutionController.pullRequestEventHandler`);
    try {
      
      const topicPublisher = new TopicPublisherPubSub(ctx);
      const dbValidationRepository = new PGValidationRepository(ctx);

      this.service = new PrExecutionService(topicPublisher, ctx, dbValidationRepository);
      
      const payload = request.payload as PrExecutionEntity;
      getLogger(ctx).trace(`Payload: ${JSON.stringify(payload)}`);

      // Validaciones básicas
      if (!payload) {
        getLogger(ctx).error(`Payload es requerido`);
        return h.response({
          error: 'INVALID_PAYLOAD',
          message: 'El payload es requerido'
        }).code(400);
      }

      const result = await this.service.pullRequestEventHandler(payload);

      return h.response({
        success: result.success,
        message: result.message
      }).code(201);
    } catch (error: unknown) {
      // Log completo con stack trace para debugging
      getLogger(ctx).error({ err: error }, 'Error en PrExecutionController.pullRequestEventHandler');
      
      // Respuesta genérica al cliente (sin detalles técnicos)
      return h.response({
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      }).code(500);
    }
  }

  /**
   * Obtiene el contexto de la solicitud
   * @param request - Solicitud HTTP
   * @returns Context
   */
  private getContext(request: Request): Context {
    return (request.app as ContextRequestApplicationState).context;
  }
}

