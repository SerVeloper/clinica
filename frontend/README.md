# Clínica — Frontend

Interfaz web con Vue 3, Vite 8, TypeScript 6 y Tailwind CSS 4 mediante `@tailwindcss/vite`. Mantiene sus propios `package.json` y `package-lock.json` dentro del monorepo.

Consultá el [README raíz](../README.md) para requisitos de Node, instalación con `npm ci --prefix frontend`, preparación del backend y arranque completo.

## Pantallas y organización

- Inicio de sesión.
- Agenda: consulta y gestión de reservas.
- Pacientes, profesionales y especialidades: listados y formularios de gestión.
- Operaciones: filtros de reservas, agenda inmediata y gestión de usuarios.

`src/modulos/` agrupa las funcionalidades; `src/compartido/` contiene el cliente HTTP y utilidades comunes, mientras que `src/componentes/` y `src/layouts/` organizan la interfaz transversal. `src/App.vue` integra las vistas.

## Configuración

Copiá [.env.example](.env.example) a `frontend/.env` solo si ese archivo no existe. La única variable de entorno utilizada por el cliente HTTP es:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

También es el valor de respaldo si la variable no está definida. Usá una URL absoluta con `/api` y sin barra final. El backend debe estar accesible desde el navegador y permitir el origen de la interfaz mediante CORS. Reiniciá Vite después de modificar el entorno.

## Scripts existentes

Desde la raíz del monorepo:

| Comando | Función |
| --- | --- |
| `npm run dev --prefix frontend` | Servidor de desarrollo; normalmente `http://localhost:5173`, confirmá la URL en la terminal |
| `npm run typecheck --prefix frontend` | Verificación con `vue-tsc --noEmit` |
| `npm run build --prefix frontend` | Verificación de TypeScript y generación de archivos estáticos en `frontend/dist/` |
| `npm run preview --prefix frontend` | Vista previa local de una salida generada; no es un servidor productivo |

No hay scripts de pruebas ni lint.

## Seguridad y despliegue independiente

Las variables `VITE_*` se exponen al navegador: no deben contener secretos. La URL de API se incorpora al generar los archivos estáticos. La sesión actual guarda el token en `localStorage`; los controles visuales no sustituyen la autorización del backend.

El frontend puede alojarse separado de la API, configurando su URL pública y los orígenes CORS correspondientes. Revisá las limitaciones del README raíz antes de un despliegue público.
