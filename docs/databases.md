# Bases de datos

## Información General

El proyecto utiliza una base de datos **PostgreSQL** denominada **Prometheus** para almacenar información relacionada con el ciclo de vida de validaciones de Pull Requests en repositorios de GitHub.

**Características de la conexión:**
- **Motor**: PostgreSQL v12 o superior
- **Schema**: `sdlc` (Software Development Life Cycle)
- **ORM**: TypeORM
- **Puerto por defecto**: 5432
- **Soporte SSL**: Configurable (opcional)
- **Sincronización automática**: Deshabilitada (synchronize: false)

La base de datos se utiliza para registrar eventos de Pull Requests capturados desde webhooks de GitHub, almacenando métricas de validación de código, estándares de programación, resultados de pruebas unitarias y estado de sincronización de documentación técnica.

## Diagrama de Base de Datos

```mermaid
erDiagram
    pr_validation {
        int id PK "Identificador único autogenerado"
        varchar(60) repository_name "Nombre del repositorio GitHub"
        varchar(100) reviewer "Usuario que revisó el PR"
        varchar(25) publisher "Usuario que publicó el PR"
        varchar(50) origin_branch "Rama de origen del PR"
        varchar(50) target_branch "Rama destino del PR"
        boolean merged "Indica si el PR fue fusionado"
        timestamp validation_created_at "Fecha de creación del registro"
        timestamp pr_created_at "Fecha de creación del PR en GitHub"
        timestamp pr_reviewed_at "Fecha de revisión del PR"
        int standard_score "Puntaje obtenido en validación de estándares"
        int standard_total "Puntaje total posible de estándares"
        float standard_percentage "Porcentaje de cumplimiento de estándares"
        int standard_score_pr "Puntaje de estándares específico del PR"
        int standard_total_pr "Total de estándares evaluados en el PR"
        float standard_percentage_pr "Porcentaje de cumplimiento del PR"
        varchar(10) technology "Tecnología utilizada en el proyecto"
        varchar(10) p_language "Lenguaje de programación principal"
        int pr_number "Número del Pull Request en GitHub"
        text pr_comment "Comentarios del PR"
        boolean doc_synchronized "Indica si la documentación está sincronizada"
        boolean unit_test_executed "Indica si las pruebas unitarias fueron ejecutadas"
        int unit_test_score "Puntaje de pruebas unitarias"
    }
```

## Descripción de Tablas

| Tabla | Descripción | Propósito Principal |
|-------|-------------|---------------------|
| **pr_validation** | Almacena el registro completo de validaciones realizadas a Pull Requests de repositorios GitHub, incluyendo métricas de calidad de código, cumplimiento de estándares y estado de sincronización de documentación. | Centralizar la información histórica de validaciones de PRs para análisis de calidad de código, métricas de cumplimiento de estándares de programación, trazabilidad de cambios y auditoría del proceso de desarrollo en el ciclo SDLC. |

## Relaciones Principales

Actualmente, el modelo de datos consta de una única tabla **pr_validation** que no tiene relaciones explícitas con otras tablas dentro del schema `sdlc` en este proyecto.

**Posibles relaciones lógicas externas** (no implementadas como foreign keys en este proyecto):
- `repository_name`: Podría relacionarse con un catálogo de repositorios
- `publisher` y `reviewer`: Podrían relacionarse con una tabla de usuarios/desarrolladores
- `pr_number` + `repository_name`: Identifican de forma única un Pull Request en GitHub (relación externa con GitHub API)
- `technology` y `p_language`: Podrían relacionarse con catálogos de tecnologías y lenguajes

**Nota**: Esta tabla actúa como un registro independiente que captura snapshots de eventos de Pull Requests para análisis y trazabilidad, sin dependencias relacionales fuertes en la base de datos local.
