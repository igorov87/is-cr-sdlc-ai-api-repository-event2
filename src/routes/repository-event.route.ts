import * as Joi from 'joi';
import { ResponseToolkit, Server, Request } from "@hapi/hapi";
import { PrExecutionController } from '../controllers/pr-execution.controller';
import { PrExecutionEntity, PullRequest, Repository, User } from '../entities/pr-execution.entity';
import { getLogger } from '../utils/logger';
import { Context, ContextRequestApplicationState } from '../middleware/context';
import * as Boom from '@hapi/boom';
const prExecutionController = new PrExecutionController();

export const RepositoryEventRoutes = (server: Server) => {
  server.route({
    method: 'POST',
    path: '/v1/pr-execution',
    options: {
      validate: {
        payload: Joi.object<PrExecutionEntity>({
          action: Joi.string().required(),
          number: Joi.number().required(),
          pull_request: Joi.object<PullRequest>({
            url: Joi.string().required(),
            id: Joi.number().optional(),
            // Permitimos cualquier otro campo adicional del webhook de GitHub
          }).unknown(true).required(),
          repository: Joi.object<Repository>({
            id: Joi.number().required(),
            name: Joi.string().required(),
            full_name: Joi.string().required(),
          }).unknown(true).required(),
          sender: Joi.object<User>({
            login: Joi.string().required(),
            id: Joi.number().required(),
          }).unknown(true).required(),
        }).unknown(true),
        failAction: (request: Request, h: ResponseToolkit, err: any) => {
          const ctx = (request.app as ContextRequestApplicationState).context;
          getLogger(ctx).warn(`Validation failed: ${JSON.stringify(err.details)}`);
          return Boom.badRequest('Invalid request data');
        }
      },
      handler: prExecutionController.pullRequestEventHandler.bind(prExecutionController),
      description: 'Recibe un evento de un repositorio, puede ser un PR o PUSH',
      notes: 'Recibe un evento de un repositorio, puede ser un PR o PUSH',
      tags: ['api', 'pr-execution', 'sdlc'],
    }
  });
};
