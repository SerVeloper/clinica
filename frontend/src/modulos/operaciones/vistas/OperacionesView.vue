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
    <div class="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-900/5">
      <h2 class="text-xl font-black text-blue-950">Operaciones de reservas</h2>
      <p class="mt-1 text-sm text-slate-500">Acciones rápidas sobre filtros y estados, separadas del calendario.</p>
      <div class="mt-5 grid gap-3 sm:grid-cols-5">
        <button type="button" class="rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-black text-blue-800 transition hover:bg-blue-50" @click="filtrosReservas.estado = ''; $emit('refrescarReservas')">Todos</button>
        <button type="button" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-900 transition hover:bg-amber-100" @click="filtrosReservas.estado = 'PENDIENTE'; $emit('refrescarReservas')">Pendientes</button>
        <button type="button" class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-black text-blue-900 transition hover:bg-blue-100" @click="filtrosReservas.estado = 'CONFIRMADA'; $emit('refrescarReservas')">Confirmadas</button>
        <button type="button" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-900 transition hover:bg-emerald-100" @click="filtrosReservas.estado = 'ATENDIDA'; $emit('refrescarReservas')">Atendidas</button>
        <button type="button" class="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-orange-900 transition hover:bg-orange-100" @click="filtrosReservas.estado = 'NO_ASISTIO'; $emit('refrescarReservas')">No asistió</button>
      </div>
      <div class="mt-5 rounded-3xl bg-blue-50 p-4">
        <p class="text-sm font-black uppercase tracking-wide text-blue-700">Filtro activo</p>
        <p class="mt-1 text-2xl font-black text-blue-950">{{ etiquetaFiltroEstado }}</p>
      </div>
    </div>

    <div class="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-900/5">
      <h2 class="text-xl font-black text-blue-950">Agenda inmediata</h2>
      <ul class="mt-4 space-y-3">
        <li v-for="reserva in proximasReservas" :key="reserva.id" class="rounded-2xl border border-blue-100 bg-blue-50 p-3">
          <p class="text-sm font-black text-blue-950">{{ formatearFecha(reserva.fechaInicio) }}</p>
          <p class="mt-1 text-sm text-slate-600">{{ nombreCompletoPaciente(reserva.pacienteId) }}</p>
          <p class="mt-1 text-xs font-black uppercase tracking-wide text-blue-700">{{ etiquetaEstado(reserva.estado) }}</p>
          <button type="button" class="mt-3 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50" @click="$emit('abrirDetalleReserva', reserva.id)">
            Ver detalle
          </button>
        </li>
        <li v-if="proximasReservas.length === 0" class="rounded-2xl border border-dashed border-blue-100 p-4 text-sm font-semibold text-slate-500">
          No hay reservas activas para mostrar.
        </li>
      </ul>
    </div>

    <div class="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-900/5 xl:col-span-2">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-xl font-black text-blue-950">Usuarios</h2>
          <p class="mt-1 text-sm text-slate-500">Alta local de usuarios y vínculo de especialistas con profesionales.</p>
        </div>
        <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700">{{ usuarios.length }} usuarios</span>
      </div>

      <form v-if="puedeCrearUsuarios" class="mt-5 grid gap-3 rounded-3xl bg-blue-50/70 p-4 md:grid-cols-6" @submit.prevent="$emit('guardarUsuario')">
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</span>
          <input v-model="formularioUsuario.nombre" required class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2" />
        </label>
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Apellido</span>
          <input v-model="formularioUsuario.apellido" required class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2" />
        </label>
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Usuario</span>
          <input v-model="formularioUsuario.usuario" required class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2" />
        </label>
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Contraseña</span>
          <input v-model="formularioUsuario.password" required type="password" class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2" />
        </label>
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Rol</span>
          <select v-model="formularioUsuario.rol" required class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2">
            <option value="ADMIN">ADMIN</option>
            <option value="ESPECIALISTA">ESPECIALISTA</option>
          </select>
        </label>
        <label class="block md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Profesional</span>
          <select v-model="formularioUsuario.profesionalId" :required="formularioUsuario.rol === 'ESPECIALISTA'" :disabled="formularioUsuario.rol === 'ADMIN'" class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2 disabled:bg-slate-100 disabled:text-slate-500">
            <option :value="null">Sin vínculo</option>
            <option v-for="profesional in profesionales" :key="profesional.id" :value="profesional.id">{{ profesional.apellido }}, {{ profesional.nombre }}</option>
          </select>
        </label>
        <div class="flex items-end md:col-span-6">
          <button class="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800">
            Crear usuario
          </button>
        </div>
      </form>

      <p v-else class="mt-5 rounded-3xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-900">Sólo un administrador puede crear usuarios.</p>

      <div class="mt-5 overflow-hidden rounded-3xl border border-blue-100">
        <table class="w-full text-left text-sm">
          <thead class="bg-blue-50 text-xs font-black uppercase tracking-wide text-blue-700">
            <tr>
              <th class="px-4 py-3">Usuario</th>
              <th class="px-4 py-3">Nombre</th>
              <th class="px-4 py-3">Rol</th>
              <th class="px-4 py-3">Profesional</th>
              <th class="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-blue-100">
            <tr v-for="usuario in usuarios" :key="usuario.id" class="bg-white">
              <td class="px-4 py-3 font-black text-blue-950">{{ usuario.usuario }}</td>
              <td class="px-4 py-3 text-slate-700">{{ usuario.apellido }}, {{ usuario.nombre }}</td>
              <td class="px-4 py-3 font-bold text-slate-700">{{ usuario.rol }}</td>
              <td class="px-4 py-3 text-slate-600">{{ usuario.profesionalId ? nombreCompletoProfesional(usuario.profesionalId) : '-' }}</td>
              <td class="px-4 py-3 text-slate-600">{{ usuario.activo ? 'Activo' : 'Inactivo' }}</td>
            </tr>
            <tr v-if="usuarios.length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-sm font-semibold text-slate-500">No hay usuarios para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
