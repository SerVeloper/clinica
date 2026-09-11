<script setup lang="ts">
import type { FiltrosReservas, Reserva, EstadoReserva } from '../../reservas/tipos/reserva'
import type { Profesional } from '../../profesionales/tipos/profesional'
import type { CrearUsuarioPayload, Usuario } from '../../usuarios/tipos/usuario'

defineProps<{
  filtrosReservas: FiltrosReservas
  etiquetaFiltroEstado: string
  proximasReservas: Reserva[]
  formatearFecha: (fecha: string) => string
  nombreCompletoPaciente: (id: string) => string
  etiquetaEstado: (estado: EstadoReserva) => string
  usuarios: Usuario[]
  profesionales: Profesional[]
  formularioUsuario: CrearUsuarioPayload
  puedeCrearUsuarios: boolean
  nombreCompletoProfesional: (id: string) => string
}>()

defineEmits<{
  refrescarReservas: []
  abrirDetalleReserva: [id: string]
  guardarUsuario: []
}>()
</script>

<template>
  <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
    <div class="rounded-[2rem] border border-borde bg-superficie p-5 shadow-xl shadow-sombra/5">
      <h2 class="text-xl font-black text-texto">Operaciones de reservas</h2>
      <p class="mt-1 text-sm text-texto-secundario">Acciones rápidas sobre filtros y estados, separadas del calendario.</p>
      <div class="mt-5 grid gap-3 sm:grid-cols-5">
        <button type="button" class="rounded-2xl border border-control bg-superficie px-4 py-3 text-sm font-black text-enlace transition hover:bg-secundaria" @click="filtrosReservas.estado = ''; $emit('refrescarReservas')">Todos</button>
        <button type="button" class="rounded-2xl border border-advertencia-borde bg-advertencia-fondo px-4 py-3 text-sm font-black text-advertencia-texto transition hover:bg-advertencia-suave" @click="filtrosReservas.estado = 'PENDIENTE'; $emit('refrescarReservas')">Pendientes</button>
        <button type="button" class="rounded-2xl border border-info-borde bg-info-fondo px-4 py-3 text-sm font-black text-info-texto transition hover:bg-info-suave" @click="filtrosReservas.estado = 'CONFIRMADA'; $emit('refrescarReservas')">Confirmadas</button>
        <button type="button" class="rounded-2xl border border-exito-borde bg-exito-fondo px-4 py-3 text-sm font-black text-exito-texto transition hover:bg-exito-suave" @click="filtrosReservas.estado = 'ATENDIDA'; $emit('refrescarReservas')">Atendidas</button>
        <button type="button" class="rounded-2xl border border-ausente-borde bg-ausente-fondo px-4 py-3 text-sm font-black text-ausente-texto transition hover:bg-ausente-suave" @click="filtrosReservas.estado = 'NO_ASISTIO'; $emit('refrescarReservas')">No asistió</button>
      </div>
      <div class="mt-5 rounded-3xl bg-secundaria p-4">
        <p class="text-sm font-black uppercase tracking-wide text-enlace">Filtro activo</p>
        <p class="mt-1 text-2xl font-black text-texto">{{ etiquetaFiltroEstado }}</p>
      </div>
    </div>

    <div class="rounded-[2rem] border border-borde bg-superficie p-5 shadow-xl shadow-sombra/5">
      <h2 class="text-xl font-black text-texto">Agenda inmediata</h2>
      <ul class="mt-4 space-y-3">
        <li v-for="reserva in proximasReservas" :key="reserva.id" class="rounded-2xl border border-borde bg-secundaria p-3">
          <p class="text-sm font-black text-texto">{{ formatearFecha(reserva.fechaInicio) }}</p>
          <p class="mt-1 text-sm text-texto-secundario">{{ nombreCompletoPaciente(reserva.pacienteId) }}</p>
          <p class="mt-1 text-xs font-black uppercase tracking-wide text-enlace">{{ etiquetaEstado(reserva.estado) }}</p>
          <button type="button" class="mt-3 rounded-xl border border-control bg-superficie px-3 py-2 text-xs font-bold text-enlace transition hover:bg-secundaria" @click="$emit('abrirDetalleReserva', reserva.id)">
            Ver detalle
          </button>
        </li>
        <li v-if="proximasReservas.length === 0" class="rounded-2xl border border-dashed border-borde p-4 text-sm font-semibold text-texto-secundario">
          No hay reservas activas para mostrar.
        </li>
      </ul>
    </div>

    <div class="rounded-[2rem] border border-borde bg-superficie p-5 shadow-xl shadow-sombra/5 xl:col-span-2">
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
  </section>
</template>
