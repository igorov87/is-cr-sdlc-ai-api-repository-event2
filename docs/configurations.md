# Variables de entorno

| Variable | Descripción | Valores |
|----------|-------------|---------|
| LOG_LEVEL | Nivel de registro de logs del sistema | `info`, `debug`, `warn`, `error` |
| PROMETHEUS_HOST | Host del servidor de base de datos PostgreSQL Prometheus | `localhost`, `prometheus.example.com`, `10.0.0.1` |
| PROMETHEUS_PORT | Puerto del servidor de base de datos PostgreSQL Prometheus | `5432`, `5433` |
| PROMETHEUS_DATABASE | Nombre de la base de datos PostgreSQL Prometheus | `prometheus`, `prometheus_db` |
| PROMETHEUS_USER | Usuario para conectarse a la base de datos PostgreSQL Prometheus | `postgres`, `admin`, `prometheus_user` |
| PROMETHEUS_PASSWORD | Contraseña del usuario de la base de datos PostgreSQL Prometheus | `password123`, `securePass!` |
| PROMETHEUS_SSL | Habilitar conexión SSL a la base de datos PostgreSQL Prometheus | `true`, `false`, `require` |
| TARGET_BRANCHES | Ramas objetivo para el procesamiento de eventos separadas por pipe | `dev\|test`, `main\|develop`, `staging\|production` |
| GCP_PROJECT_ID | ID del proyecto de Google Cloud Platform para Pub/Sub | `my-gcp-project`, `proyecto-interseguro-dev` |
| PUBSUB_VALIDATION_TOPIC | Nombre del tópico de Pub/Sub para mensajes de validación | `validation-topic`, `pr-validation-events` |
| PUBSUB_UPDATE_TOPIC | Nombre del tópico de Pub/Sub para mensajes de actualización | `update-topic`, `pr-update-events` |
| PUBSUB_DOCUMENT_SYNC_TOPIC | Nombre del tópico de Pub/Sub para sincronización de documentos | `document-sync-topic`, `confluence-sync-events` |
