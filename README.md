# is-cr-sdlc-ai-api-repository-event

## Descripción y propósito

API REST desarrollada con Hapi.js para recibir y procesar eventos de repositorios GitHub dentro del flujo SDLC (Software Development Life Cycle) de Interseguro. El servicio actúa como webhook receptor de eventos relacionados con Pull Requests, validando la información recibida, almacenándola en una base de datos PostgreSQL (Prometheus) y publicando mensajes a tópicos de Google Cloud Pub/Sub para procesamiento asíncrono.

El propósito principal es centralizar la captura de eventos de repositorios y orquestar el flujo de validación y sincronización de documentación técnica asociada a los cambios de código.

## Repositorio

```
https://github.com/Interseguro/is-cr-sdlc-ai-api-repository-event.git
```

## Requisitos

Para configurar el ambiente de desarrollo necesitas:

- **Node.js**: v18.x o superior
- **npm**: v8.x o superior
- **TypeScript**: v4.9.5
- **PostgreSQL**: v12 o superior (para base de datos Prometheus)
- **Google Cloud SDK**: Configurado con credenciales para Pub/Sub
- **Cuenta GCP**: Con acceso a proyecto y permisos para Pub/Sub
- **Git**: Para clonar el repositorio

## Estructura del proyecto

```
is-cr-sdlc-ai-api-repository-event/
├── .cursor/                                      # Reglas y configuraciones del editor Cursor
│   └── rules/                                    # Reglas de desarrollo del proyecto
│       ├── code-standard.mdc                     # Estándares de código y nomenclatura
│       ├── documentation.mdc                     # Estándares de documentación
│       ├── guidelines.mdc                        # Lineamientos de arquitectura en capas
│       └── security.mdc                          # Estándares de seguridad
├── .github/                                      # Configuración de GitHub
│   ├── CODEOWNERS                                # Propietarios del código
│   └── workflows/                                # Workflows de CI/CD
│       ├── build-deploy.yaml                     # Pipeline de construcción y despliegue
│       └── pull_request_approval.yaml            # Validación de Pull Requests
├── src/                                          # Código fuente de la aplicación
│   ├── controllers/                              # Controladores HTTP (capa de presentación)
│   │   └── pr-execution.controller.ts            # Controlador para eventos de Pull Request
│   ├── entities/                                 # DTOs de entrada y salida
│   │   ├── pr-execution.entity.ts                # Entidad de evento de PR
│   │   └── topic-message.ts                      # Entidad de mensaje para Pub/Sub
│   ├── mappers/                                  # Transformadores de datos entre capas
│   │   └── service-mappers.ts                    # Mappers para servicios
│   ├── middleware/                               # Middlewares de Hapi
│   │   └── context.ts                            # Gestión de contexto y trazabilidad
│   ├── publisher/                                # Capa de publicación a Pub/Sub
│   │   ├── impl/                                 # Implementaciones concretas
│   │   │   └── topic-publisher-pubsub.ts         # Implementación para GCP Pub/Sub
│   │   └── topic-publisher.ts                    # Interfaz de publicador
│   ├── repository/                               # Capa de acceso a datos
│   │   ├── impl/                                 # Implementaciones de repositorios
│   │   │   └── pg-validation-repository.ts       # Repositorio PostgreSQL para validaciones
│   │   ├── models/                               # Modelos de base de datos (TypeORM)
│   │   │   └── pr-validation.model.ts            # Modelo de validación de PR
│   │   └── db-validation-repository.ts           # Interfaz del repositorio
│   ├── routes/                                   # Definición de rutas HTTP
│   │   └── repository-event.route.ts             # Rutas para eventos de repositorio
│   ├── services/                                 # Lógica de negocio
│   │   └── pr-execution.service.ts               # Servicio de procesamiento de PR
│   ├── utils/                                    # Utilidades y helpers
│   │   ├── database.ts                           # Configuración de conexión PostgreSQL
│   │   ├── environment.ts                        # Variables de entorno centralizadas
│   │   ├── error-handler.ts                      # Manejo centralizado de errores
│   │   └── logger.ts                             # Configuración de logs con Pino
│   └── index.ts                                  # Punto de entrada de la aplicación
├── tests/                                        # Pruebas unitarias
│   ├── controllers/                              # Tests de controladores
│   │   └── pr-execution.controller.test.ts       # Tests del controlador de PR
│   ├── mappers/                                  # Tests de mappers
│   │   └── service-mappers.test.ts               # Tests de transformación
│   ├── publisher/                                # Tests de publicadores
│   │   └── topic-publisher-pubsub.test.ts        # Tests de Pub/Sub
│   ├── repository/                               # Tests de repositorios
│   │   └── pg-validation-repository.test.ts      # Tests de acceso a datos
│   ├── services/                                 # Tests de servicios
│   │   └── pr-execution.service.test.ts          # Tests de lógica de negocio
│   └── utils/                                    # Tests de utilidades
│       └── error-handler.test.ts                 # Tests de manejo de errores
├── .env.example                                  # Ejemplo de variables de entorno
├── .gitignore                                    # Archivos ignorados por Git
├── Dockerfile                                    # Definición de imagen Docker
├── package.json                                  # Dependencias y scripts de Node.js
├── tsconfig.json                                 # Configuración de TypeScript
└── README.md                                     # Documentación del proyecto
```

## Quickstart

Para levantar el servicio en ambiente local:

```bash
# 1. Clonar el repositorio
git clone https://github.com/Interseguro/is-cr-sdlc-ai-api-repository-event.git
cd is-cr-sdlc-ai-api-repository-event

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Compilar el proyecto TypeScript
npm run build

# 5. Iniciar en modo desarrollo (con hot-reload)
npm run dev

# O iniciar en modo producción
npm start

# 6. Ejecutar pruebas unitarias
npm test
```

El servicio estará disponible en `http://localhost:8080`

## Configuración esencial

Variables de entorno necesarias en el archivo `.env`:

### Configuración del servidor
```bash
PORT=8080                           # Puerto donde corre el servidor
LOG_LEVEL=info                      # Nivel de logs (debug, info, warn, error)
```

### Base de datos PostgreSQL (Prometheus)
```bash
PROMETHEUS_HOST=localhost           # Host de la base de datos
PROMETHEUS_PORT=5432                # Puerto de PostgreSQL
PROMETHEUS_DATABASE=prometheus      # Nombre de la base de datos
PROMETHEUS_USER=postgres            # Usuario de base de datos
PROMETHEUS_PASSWORD=your_password   # Contraseña de base de datos
PROMETHEUS_SSL=false                # Usar SSL (true/false o require)
```

### Google Cloud Pub/Sub
```bash
GCP_PROJECT_ID=your-gcp-project-id                  # ID del proyecto GCP
PUBSUB_VALIDATION_TOPIC=pr-validation-topic         # Tópico para validaciones
PUBSUB_UPDATE_TOPIC=pr-update-topic                 # Tópico para actualizaciones
PUBSUB_DOCUMENT_SYNC_TOPIC=document-sync-topic      # Tópico para sincronización
```

### Configuración de negocio
```bash
TARGET_BRANCHES=dev|test            # Branches objetivo (regex pattern)
```

### Autenticación GCP (opcional si usas Application Default Credentials)
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## Despliegue

**Dónde vive:** GCP Cloud Run

**Ambientes:** Dev / Stg / Prod → docs/deployment.md
