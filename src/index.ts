/**
 * is-cr-sdlc-ai-api-repository-event
 * API para recibir los eventos de los repositorios para el flujo SDLC
 *
 * @author Ernesto Laura
 */

// Cargar variables de entorno desde archivo .env
import * as dotenv from 'dotenv';
dotenv.config();

import * as Hapi from "@hapi/hapi";
import { RepositoryEventRoutes } from './routes/repository-event.route';
import { contextServerMiddleware, responseHeadersMiddleware } from './middleware/context';
import { HealthPlugin } from 'hapi-k8s-health'
import { connectToDatabase } from './utils/database';

const init = async () => {
  // Inicializar conexión a la base de datos antes de iniciar el servidor
  await connectToDatabase();
  const server = Hapi.server({
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ["*"]
      }
    }
  });

  // Registra el path /liveness y /readiness para que se puedan hacer pruebas de salud
  await server.register({
    plugin: HealthPlugin,
    options: {
      livenessProbes: {
        status: () => Promise.resolve('OK')
      },
      readinessProbes: {
        // Implementación del rediness según corresponda
        //service: () => Promise.resolve('OK')
      }
    }
  });

  // Contexto de la aplicación
  contextServerMiddleware(server);
  // Headers de respuesta
  responseHeadersMiddleware(server);
  // Inicia los routes
  RepositoryEventRoutes(server);
  // Inicia el servidor
  await server.start();
  console.info(`[is-cr-sdlc-ai-api-repository-event] Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
