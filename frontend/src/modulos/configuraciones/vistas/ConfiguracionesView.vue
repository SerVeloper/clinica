<script setup lang="ts">
import type { Profesional } from '../../profesionales/tipos/profesional'
import type { CrearUsuarioPayload, Usuario } from '../../usuarios/tipos/usuario'

// Subsecciones de configuración global de la clínica.
// Para agregar una futura sección (ej: notificaciones, facturación): 1) sumar
// su id al tipo `IdSeccionConfiguracion`, 2) agregar su bloque v-if en el
// template. La navegación entre secciones la provee el sidebar.
export type IdSeccionConfiguracion = 'perfil' | 'usuarios' | 'clinica' | 'horarios'

const props = defineProps<{
  usuarios: Usuario[]
  profesionales: Profesional[]
  formularioUsuario: CrearUsuarioPayload
  puedeCrearUsuarios: boolean
  nombreCompletoProfesional: (id: string) => string
  subSeccionActiva: IdSeccionConfiguracion
}>()

const emit = defineEmits<{
  guardarUsuario: []
}>()
</script>

<template>
  <section class="grid gap-6">
    <div
      v-if="subSeccionActiva === 'usuarios'"
      class="rounded-[2rem] border border-borde bg-superficie p-5 shadow-xl shadow-sombra/5"
    >
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-xl font-black text-texto">Usuarios</h2>
          <p class="mt-1 text-sm text-texto-secundario">Alta local de usuarios y vínculo de especialistas con profesionales.</p>
        </div>
        <span class="rounded-full bg-secundaria px-3 py-1 text-xs font-black uppercase tracking-wide text-enlace">{{ usuarios.length }} usuarios</span>
      </div>

      <form v-if="puedeCrearUsuarios" class="mt-5 grid gap-3 rounded-3xl bg-secundaria p-4 md:grid-cols-6" @submit.prevent="$emit('guardarUsuario')">
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">Nombre</span>
          <input v-model="formularioUsuario.nombre" required class="mt-1 w-full rounded-2xl border border-control bg-superficie px-3 py-2" />
        </label>
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">Apellido</span>
          <input v-model="formularioUsuario.apellido" required class="mt-1 w-full rounded-2xl border border-control bg-superficie px-3 py-2" />
        </label>
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">Usuario</span>
          <input v-model="formularioUsuario.usuario" required class="mt-1 w-full rounded-2xl border border-control bg-superficie px-3 py-2" />
        </label>
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">Contraseña</span>
          <input v-model="formularioUsuario.password" required type="password" class="mt-1 w-full rounded-2xl border border-control bg-superficie px-3 py-2" />
        </label>
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">Rol</span>
          <select v-model="formularioUsuario.rol" required class="mt-1 w-full rounded-2xl border border-control bg-superficie px-3 py-2">
            <option value="ADMIN">ADMIN</option>
            <option value="ESPECIALISTA">ESPECIALISTA</option>
          </select>
        </label>
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">Profesional</span>
          <select v-model="formularioUsuario.profesionalId" :required="formularioUsuario.rol === 'ESPECIALISTA'" :disabled="formularioUsuario.rol === 'ADMIN'" class="mt-1 w-full rounded-2xl border border-control bg-superficie px-3 py-2 disabled:bg-deshabilitado disabled:text-texto-deshabilitado">
            <option :value="null">Sin vínculo</option>
            <option v-for="profesional in profesionales" :key="profesional.id" :value="profesional.id">{{ profesional.apellido }}, {{ profesional.nombre }}</option>
          </select>
        </label>
        <div class="flex items-end md:col-span-6">
          <button class="rounded-2xl bg-accion px-5 py-3 text-sm font-black text-sobre-accion shadow-lg shadow-sombra/20 transition hover:bg-accion-hover">
            Crear usuario
          </button>
        </div>
      </form>

      <p v-else class="mt-5 rounded-3xl border border-advertencia-borde bg-advertencia-fondo p-4 text-sm font-semibold text-advertencia-texto">Sólo un administrador puede crear usuarios.</p>

      <div class="mt-5 overflow-hidden rounded-3xl border border-borde">
        <table class="w-full text-left text-sm">
          <thead class="bg-secundaria text-xs font-black uppercase tracking-wide text-enlace">
            <tr>
              <th class="px-4 py-3">Usuario</th>
              <th class="px-4 py-3">Nombre</th>
              <th class="px-4 py-3">Rol</th>
              <th class="px-4 py-3">Profesional</th>
              <th class="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-borde">
            <tr v-for="usuario in usuarios" :key="usuario.id" class="bg-superficie">
              <td class="px-4 py-3 font-black text-texto">{{ usuario.usuario }}</td>
              <td class="px-4 py-3 text-texto-secundario">{{ usuario.apellido }}, {{ usuario.nombre }}</td>
              <td class="px-4 py-3 font-bold text-texto-secundario">{{ usuario.rol }}</td>
              <td class="px-4 py-3 text-texto-secundario">{{ usuario.profesionalId ? nombreCompletoProfesional(usuario.profesionalId) : '-' }}</td>
              <td class="px-4 py-3 text-texto-secundario">{{ usuario.activo ? 'Activo' : 'Inactivo' }}</td>
            </tr>
            <tr v-if="usuarios.length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-sm font-semibold text-texto-secundario">No hay usuarios para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Clínica: datos globales de la clínica (nombre, contacto, logo) -->
    <div
      v-if="subSeccionActiva === 'clinica'"
      class="rounded-[2rem] border border-borde bg-superficie p-5 shadow-xl shadow-sombra/5"
    >
      <h2 class="text-xl font-black text-texto">Clínica</h2>
      <p class="mt-1 text-sm text-texto-secundario">Datos generales de la clínica como nombre, contacto y logo.</p>
      <p class="mt-5 rounded-3xl border border-dashed border-borde p-4 text-sm font-semibold text-texto-secundario">
        Esta sección se habilita en una próxima funcionalidad.
      </p>
    </div>

    <!-- Horarios: horarios de atención de la clínica -->
    <div
      v-if="subSeccionActiva === 'horarios'"
      class="rounded-[2rem] border border-borde bg-superficie p-5 shadow-xl shadow-sombra/5"
    >
      <h2 class="text-xl font-black text-texto">Horarios</h2>
      <p class="mt-1 text-sm text-texto-secundario">Horarios de atención de la clínica y de cada especialidad.</p>
      <p class="mt-5 rounded-3xl border border-dashed border-borde p-4 text-sm font-semibold text-texto-secundario">
        Esta sección se habilita en una próxima funcionalidad.
      </p>
    </div>
  <!-- Perfil: datos del usuario autenticado -->
    <div
      v-if="subSeccionActiva === 'perfil'"
      class="rounded-[2rem] border border-borde bg-superficie p-5 shadow-xl shadow-sombra/5"
    >
      <h2 class="text-xl font-black text-texto">Perfil</h2>
      <p class="mt-1 text-sm text-texto-secundario">Datos del usuario autenticado.</p>
      <p class="mt-5 rounded-3xl border border-dashed border-borde p-4 text-sm font-semibold text-texto-secundario">
        Esta sección se habilita en una próxima funcionalidad.
      </p>
    </div>
  </section>
</template>