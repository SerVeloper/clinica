# Clínica — Backend

API en NestJS 11, TypeScript 6, TypeORM y PostgreSQL, con Swagger/OpenAPI. Forma parte del monorepo y conserva sus propios `package.json` y `package-lock.json`.

Consultá el [README raíz](../README.md) para requisitos, instalación con `npm ci --prefix backend`, configuración de PostgreSQL, inicialización local del esquema y limitaciones de seguridad.

## Estructura

- `src/main.ts`: arranque HTTP, prefijo `/api`, validación, CORS y Swagger.
- `src/app.module.ts`: configuración de entorno, PostgreSQL e integración de módulos.
- `src/modulos/`: pacientes, profesionales, especialidades, reservas y usuarios, separados en `dominio`, `aplicacion` e `infraestructura`.
- `src/compartido/`: errores de negocio, paginación y utilidades compartidas.

## Entorno y arranque

Usá [.env.example](.env.example) como plantilla de `backend/.env`, sin sobrescribir un archivo existente. Incluye `PUERTO`, `DB_HOST`, `DB_PORT`, `DB_USUARIO`, `DB_PASSWORD`, `DB_NOMBRE`, `DB_SINCRONIZAR` y `AUTH_SECRETO`.

La base debe existir. `DB_SINCRONIZAR` es `false` por defecto; una base vacía requiere el procedimiento **exclusivamente local** del README raíz antes de poder ejecutar las semillas. El inicio asegura especialidades iniciales y un administrador con credenciales fijas definidas en `src/modulos/usuarios/aplicacion/servicios/usuarios.servicio.ts`.

Desde la raíz del monorepo:

```bash
npm run start:dev --prefix backend
```

- API: `http://localhost:3000/api`.
- Swagger: `http://localhost:3000/api/docs`.
- Configurá otro puerto mediante `PUERTO` si es necesario.

## Scripts existentes

| Comando desde la raíz | Función |
| --- | --- |
| `npm run start --prefix backend` | Ejecuta `nest start` |
| `npm run start:dev --prefix backend` | Ejecuta Nest en modo watch |
| `npm run typecheck --prefix backend` | Verifica tipos con `tsc --noEmit` |

No hay scripts de build, pruebas, lint ni migraciones. Los endpoints y DTO actuales se pueden consultar en Swagger y en los controladores de cada módulo.

## Estado de seguridad

Hay login y controles de sesión en algunos endpoints, pero no protección global. El secreto de firma tiene un valor de respaldo en código, los tokens no verifican expiración y CORS permite orígenes dinámicos. Estas limitaciones y el administrador inicial deben resolverse antes de exponer la API. La sincronización de TypeORM no reemplaza migraciones productivas.
