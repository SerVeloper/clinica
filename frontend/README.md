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

## Temas claro y oscuro

- Sidebar expandido: selector de tres opciones **Claro / Oscuro / Sistema**. Colapsado: un botón recorre **Claro → Oscuro → Sistema → Claro**, con nombre accesible y ayuda que indican el tema actual y el siguiente.
- En móvil el selector está en la cabecera; también está disponible en el inicio de sesión.
- `src/temas/paletas.css` define dos paletas con los mismos 69 roles: claro en `:root` y oscuro en `html[data-tema="oscuro"]`. `src/style.css` los conecta con utilidades mediante `@theme inline`. Los componentes consumen roles, sin invertir colores ni sobrescribir familias de Tailwind.

| Rol / utilidad | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `bg-pagina` | `#F8FAFC` | `#0F172A` | Fondo general |
| `bg-superficie` | `#FFFFFF` | `#1E293B` | Tarjetas, diálogos y campos |
| `bg-secundaria` | `#F1F5F9` | `#334155` | Secciones internas y cabeceras |
| `text-texto` / `text-texto-secundario` | `#0F172A` / `#475569` | `#F8FAFC` / `#CBD5E1` | Contenido y ayudas |
| `border-borde` | `#E2E8F0` | `#475569` | Separadores decorativos; no identifica controles |
| `border-control` / `outline` de foco | `#64748B` / `#1D4ED8` | `#94A3B8` / `#93C5FD` | Límites de campos y foco visible |
| `bg-accion` / `hover:bg-accion-hover` | `#1D4ED8` / `#1E40AF` | `#2563EB` / `#1D4ED8` | Botones, con `text-sobre-accion` blanco |
| `text-enlace` | `#1D4ED8` | `#93C5FD` | Enlaces y acciones sobre superficies |

Los roles `exito-*`, `advertencia-*`, `error-*`, `info-*` y `ausente-*` tienen fondos, textos y bordes propios. Para acciones sólidas usá `*-fuerte` / `*-hover` con `text-sobre-accion`; no uses el color de texto de un estado como fondo de botón. `overlay`, `sombra` y `tooltip` también pertenecen a las paletas.

La agenda conserva seis identidades `--especialidad-N-{fondo,borde,texto}`, elegidas por el hash existente en `App.vue`, independientes de la leyenda de estados. Las confirmadas usan el borde como fondo y `--especialidad-confirmada-texto`; las terminales mantienen fondo neutro y tachado, sin reducir la opacidad del texto. Pendiente, confirmada, atendida, no asistió y cancelada conservan sus etiquetas y badges. Hoy, pasado, inicio inválido, pausa y hora actual tienen tratamientos explícitos; la hora actual tiene prioridad de fondo y hoy conserva su contorno.

**Validación sin build:** `npm run typecheck --prefix frontend` y comprobación sRGB/WCAG mediante script liviano: 88 pares por tema, incluyendo texto normal/secundario/enlace, acciones y hover, estados, seis especialidades, tooltips y controles. Mínimos obtenidos: texto **5,02:1 claro / 5,17:1 oscuro** (objetivo 4,5:1); bordes de control/foco **3,90:1 / 4,04:1** (objetivo 3:1). Los bordes decorativos no tienen ese objetivo. La transparencia queda reservada a sombras, overlay, adornos y controles nativamente deshabilitados; no a texto de reservas consultables.

**QA visual pendiente:** recorrer ambos temas y Sistema en escritorio/móvil/login; verificar teclado y foco, scroll sticky y tooltips de agenda, seis especialidades y cinco estados, hoy/pasado/pausa/hora actual, alta rápida, detalle de reserva, CRUD y toasts superpuestos. Los cálculos de paleta no reemplazan revisar el contraste renderizado ni las interacciones en navegador.

## Seguridad y despliegue independiente

Las variables `VITE_*` se exponen al navegador: no deben contener secretos. La URL de API se incorpora al generar los archivos estáticos. La sesión actual guarda el token en `localStorage`; los controles visuales no sustituyen la autorización del backend.

El frontend puede alojarse separado de la API, configurando su URL pública y los orígenes CORS correspondientes. Revisá las limitaciones del README raíz antes de un despliegue público.
