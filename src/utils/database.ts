import { DataSource, LoggerOptions } from 'typeorm';
import { PrValidationModel } from '../repository/models/pr-validation.model';
import {
  LOG_LEVEL,
  PROMETHEUS_HOST,
  PROMETHEUS_DATABASE,
  PROMETHEUS_USER,
  PROMETHEUS_PASSWORD,
  PROMETHEUS_PORT,
  PROMETHEUS_SSL
} from './environment';

if (!PROMETHEUS_HOST || !PROMETHEUS_DATABASE || !PROMETHEUS_USER || !PROMETHEUS_PASSWORD) {
  throw new Error('Environment variables for Prometheus database are not set properly');
}

export const dataSource = new DataSource({
  type: "postgres",
  host: PROMETHEUS_HOST,
  port: PROMETHEUS_PORT ? Number(PROMETHEUS_PORT) : 5432,
  username: PROMETHEUS_USER,
  password: PROMETHEUS_PASSWORD,
  database: PROMETHEUS_DATABASE,
  entities: [PrValidationModel],
  synchronize: false,
  logging: LOG_LEVEL as LoggerOptions,
  ssl: PROMETHEUS_SSL ? {
    rejectUnauthorized: false
  } : false,
});

export const connectToDatabase = async (): Promise<void> => {
  console.log(`Conectando a Prometheus PostgreSQL en ${PROMETHEUS_HOST}...`);
  await dataSource
    .initialize()
    .then(() => {
      console.log('Conectado a la base de datos PostgreSQL de Prometheus');
    })
    .catch((error) => {
      console.error('Error al conectarse a la base de datos de Prometheus:', error);
      process.exit(1);
    });
};

export const checkConnection = (): string => {
  const isInitialized = dataSource.isInitialized;
  if (isInitialized) {
    return "OK";
  }
  throw new Error("ERROR");
} 