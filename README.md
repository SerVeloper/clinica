# Clínica

Sistema de gestión de clínica en desarrollo. Este monorepo reúne dos aplicaciones independientes: una API en `backend/` y una interfaz web en `frontend/`. Cada una conserva su propio `package.json`, `package-lock.json` y dependencias; no hay un paquete raíz ni npm workspaces.

Repositorio previsto: `git@github.com:SerVeloper/clinica.git`.

## Funcionalidades y estado

- Gestión de pacientes, profesionales y especialidades: altas, listados, edición y cambios de estado.
- Reservas: creación, consulta, filtros, cancelación y actualización de estado.
- Interfaz de agenda y panel de operaciones de reservas.
- Inicio de sesión y gestión de usuarios con roles de administrador y especialista.
- Documentación de la API con Swagger/OpenAPI.

Es una base de desarrollo, **no está lista para producción**. La existencia de login no implica protección completa de la API; consultá las limitaciones de seguridad más abajo. No hay scripts de pruebas automatizadas, lint ni migraciones.

## Stack y estructura

| Aplicación | Tecnologías |
| --- | --- |
| Backend | NestJS 11, TypeScript 6, TypeORM, PostgreSQL, Swagger |
| Frontend | Vue 3, Vite 8, TypeScript 6, Tailwind CSS 4 |

```text
clinica/
├── README.md
├── .gitignore
├── backend/
│   ├── .env.example
│   ├── README.md
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── compartido/
│       └── modulos/       # dominio, aplicacion e infraestructura
└── frontend/
    ├── .env.example
    ├── README.md
    ├── package.json
    ├── package-lock.json
    ├── vite.config.ts
    ├── public/
    └── src/
        ├── App.vue
        ├── compartido/
        ├── componentes/
        ├── layouts/
        └── modulos/
```

Se mantienen los nombres en español y la arquitectura por capas del backend.

## Requisitos

- Node.js **22.x, versión 22.12.0 o posterior dentro de esa rama**, con npm. Vite 8 requiere Node `^20.19.0 || >=22.12.0`.
- PostgreSQL instalado y en ejecución, con una base y un usuario dedicados al desarrollo local.
- Dos terminales para ejecutar las aplicaciones.

Todos los comandos siguientes se ejecutan desde la raíz `clinica/`.

## Preparación local

### 1. Instalar las dependencias de cada aplicación

```bash
npm ci --prefix backend
npm ci --prefix frontend
```

Cada comando utiliza el lockfile de su aplicación. Versioná ambos `package-lock.json` junto con los cambios de dependencias correspondientes.

### 2. Configurar el entorno

Copiá los ejemplos **solo si todavía no existe el `.env` correspondiente**; estos comandos evitan sobrescribirlo:

```bash
test -e backend/.env || cp backend/.env.example backend/.env
test -e frontend/.env || cp frontend/.env.example frontend/.env
```

Editá tus archivos locales y reemplazá los marcadores ficticios. No publiques los `.env`.

| Variable del backend | Uso |
| --- | --- |
| `PUERTO` | Puerto HTTP, por defecto `3000` |
| `DB_HOST` / `DB_PORT` | Servidor PostgreSQL y puerto, normalmente `localhost:5432` |
| `DB_USUARIO` / `DB_PASSWORD` | Usuario local y su contraseña |
| `DB_NOMBRE` | Base de datos existente |
| `DB_SINCRONIZAR` | Sincronización del esquema; solo el valor literal `true` la activa, por defecto `false` |
| `AUTH_SECRETO` | Secreto privado para firmar tokens; reemplazá el marcador por un valor aleatorio propio |

El frontend usa `VITE_API_URL=http://localhost:3000/api`. Debe ser una URL absoluta, incluir `/api` y no terminar en `/`. Las variables `VITE_*` son públicas en el navegador: nunca coloques secretos allí. Reiniciá el servidor de desarrollo al cambiar su entorno.

### 3. Crear la base y preparar el esquema local

Con una cuenta administradora de PostgreSQL, creá un rol de desarrollo con permiso de inicio de sesión y una base vacía de su propiedad. Por ejemplo, desde `psql`:

```sql
CREATE ROLE clinica_local LOGIN;
\password clinica_local
CREATE DATABASE clinica_local OWNER clinica_local;
```

`\password` solicita la contraseña de forma interactiva. Usá esa contraseña en tu `backend/.env`, junto con `DB_USUARIO=clinica_local` y `DB_NOMBRE=clinica_local`. La aplicación necesita permisos para crear tablas en el esquema local durante la inicialización. Si elegís otros nombres, ajustá las variables.

**TypeORM no crea la base de datos.** El ejemplo mantiene `DB_SINCRONIZAR=false`, por lo que una base vacía todavía no puede arrancar correctamente: los servicios de semillas consultan tablas durante el inicio.

Para inicializar **únicamente una base local descartable, sin datos reales**:

1. Confirmá que `DB_HOST` y `DB_NOMBRE` apuntan a esa base local.
2. Cambiá temporalmente `DB_SINCRONIZAR=true` en tu `backend/.env`.
3. Arrancá el backend con el comando de la siguiente sección. TypeORM crea el esquema a partir de las entidades; luego se aseguran las especialidades Medicina y Odontología y un administrador inicial si no existe.
4. Tras un arranque exitoso, detené el backend, restaurá `DB_SINCRONIZAR=false` y volvé a iniciarlo.

La sincronización puede alterar o eliminar datos al cambiar las entidades. No la uses sobre una base compartida o productiva. No hay migraciones configuradas: los cambios posteriores de esquema requieren planificarlas; para experimentar localmente se puede reinicializar una base descartable asumiendo la pérdida de sus datos.

## Ejecutar en desarrollo

Terminal 1 — API:

```bash
npm run start:dev --prefix backend
```

Terminal 2 — interfaz:

```bash
npm run dev --prefix frontend
```

| Servicio | URL local |
| --- | --- |
| Interfaz | `http://localhost:5173` por defecto; usá la URL que indique Vite si el puerto está ocupado |
| Base de la API | `http://localhost:3000/api` |
| Swagger | `http://localhost:3000/api/docs` |

El prefijo `/api` no es una página de inicio ni un endpoint de salud. Si cambiás `PUERTO`, actualizá también `VITE_API_URL`.

Para el primer ingreso local, revisá la semilla en `backend/src/modulos/usuarios/aplicacion/servicios/usuarios.servicio.ts`: actualmente crea un administrador con credenciales fijas. No se reproducen aquí ni se configuran mediante los ejemplos de entorno.

## Verificación disponible

```bash
npm run typecheck --prefix backend
npm run typecheck --prefix frontend
```

Estos comandos verifican tipos; no reemplazan pruebas de comportamiento ni validan la conexión a PostgreSQL. Los scripts disponibles se detallan en [backend/README.md](backend/README.md) y [frontend/README.md](frontend/README.md).

## Seguridad y despliegue

- Usá datos ficticios durante el desarrollo. Los `.env`, claves, respaldos y datos locales no deben versionarse; los `.env.example` contienen solo valores de ejemplo.
- El arranque crea un administrador con credenciales fijas y la firma de tokens tiene un secreto de respaldo en código. Antes de exponer el servicio hace falta reemplazar ese mecanismo de alta y configurar un secreto privado real.
- La validación de sesión se aplica solo en determinados endpoints. No hay protección global de la API; los tokens actuales no verifican expiración y el frontend los guarda en `localStorage`.
- CORS está configurado con `origin: true`. Hay que restringir los orígenes y revisar autorización, sesiones y exposición de Swagger antes de un despliegue público.
- Hace falta incorporar migraciones y un procedimiento de despliegue y recuperación de datos. `DB_SINCRONIZAR` debe permanecer desactivado fuera del entorno local descartable.

Las aplicaciones **pueden desplegarse por separado**: el backend necesita un entorno Node y PostgreSQL; el frontend puede servirse como archivos estáticos. `VITE_API_URL` debe apuntar a la API accesible desde el navegador y se incorpora al generar el frontend; cambiarla requiere regenerarlo. El repositorio no incluye un procedimiento productivo completo ni un script de build del backend. La separación de carpetas permite evolucionar ambos despliegues sin introducir workspaces.
