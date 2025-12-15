import * as dotenv from 'dotenv';
dotenv.config();


export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Variables de entorno para la base de datos PostgreSQL de Prometheus
export const PROMETHEUS_HOST = process.env.PROMETHEUS_HOST || 'localhost';
export const PROMETHEUS_PORT = process.env.PROMETHEUS_PORT || '5432';
export const PROMETHEUS_DATABASE = process.env.PROMETHEUS_DATABASE || 'prometheus';
export const PROMETHEUS_USER = process.env.PROMETHEUS_USER || 'postgres';
export const PROMETHEUS_PASSWORD = process.env.PROMETHEUS_PASSWORD || '';
export const PROMETHEUS_SSL = process.env.PROMETHEUS_SSL === 'true' || process.env.PROMETHEUS_SSL === 'require';

export const TARGET_BRANCHES = process.env.TARGET_BRANCHES || 'dev|test';

// Variables de entorno para Google Cloud Pub/Sub
export const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || '';
export const PUBSUB_VALIDATION_TOPIC = process.env.PUBSUB_VALIDATION_TOPIC || '';
export const PUBSUB_UPDATE_TOPIC = process.env.PUBSUB_UPDATE_TOPIC || '';
export const PUBSUB_DOCUMENT_SYNC_TOPIC = process.env.PUBSUB_DOCUMENT_SYNC_TOPIC || '';