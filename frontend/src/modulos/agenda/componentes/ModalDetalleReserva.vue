<script setup lang="ts">
import Icono from '../../../compartido/componentes/Icono.vue'
import { enlaceTelefono, enlaceWhatsapp } from '../../../compartido/contacto/contacto'
import type { EstadoReserva, Reserva } from '../../reservas/tipos/reserva'

defineProps<{
  abierto: boolean
  cargando: boolean
  reserva: Reserva | null
  estadosReserva: EstadoReserva[]
  apellidoPaciente: (id: string) => string
  nombreCompletoPaciente: (id: string) => string
  nombreCompletoProfesional: (id: string) => string
  telefonoPaciente: (id: string) => string | null
  telefonoProfesional: (id: string) => string | null
  nombreEspecialidad: (id: string) => string
  formatearFecha: (fecha: string) => string
  formatearHora: (fecha: string) => string
  clasesReserva: (estado: EstadoReserva) => string
  etiquetaEstado: (estado: EstadoReserva) => string
  esEstadoTerminal: (estado: EstadoReserva) => boolean
  nombreUsuario: (id: string | null) => string
}>()

defineEmits<{
  cerrar: []
  cancelar: [id: string]
  cambiarEstado: [reserva: Reserva, estado: EstadoReserva]
}>()
</script>

<template>
  <section v-if="abierto && reserva" class="fixed inset-0 z-50 grid place-items-center bg-blue-950/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-detalle" @click.self="$emit('cerrar')">
    <div class="w-full max-w-xl rounded-[2rem] border border-white/80 bg-white p-6 shadow-2xl shadow-blue-950/30 md:p-8">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.22em] text-blue-700">Detalle de reserva</p>
          <h2 id="titulo-modal-detalle" class="mt-2 text-3xl font-black text-blue-950">{{ apellidoPaciente(reserva.pacienteId) }}</h2>
          <p class="mt-2 text-sm text-slate-500">{{ formatearFecha(reserva.fechaInicio) }} a {{ formatearHora(reserva.fechaFin) }}</p>
        </div>
        <button type="button" class="rounded-full border border-blue-100 px-4 py-3 text-blue-700 transition hover:bg-blue-50" aria-label="Cerrar detalle" @click="$emit('cerrar')">
          x
        </button>
      </div>

      <dl class="mt-6 grid gap-3 rounded-3xl bg-blue-50/70 p-4 text-sm">
        <div class="flex items-center justify-between gap-4">
          <dt class="font-bold text-slate-500">Paciente</dt>
          <dd class="text-right font-black text-blue-950">{{ nombreCompletoPaciente(reserva.pacienteId) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-4">
          <dt class="font-bold text-slate-500">Profesional</dt>
          <dd class="text-right font-black text-blue-950">{{ nombreCompletoProfesional(reserva.profesionalId) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-4">
          <dt class="font-bold text-slate-500">Especialidad</dt>
          <dd class="text-right font-black text-blue-950">{{ nombreEspecialidad(reserva.especialidadId) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-4">
          <dt class="font-bold text-slate-500">Estado actual</dt>
          <dd class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide" :class="clasesReserva(reserva.estado)">{{ etiquetaEstado(reserva.estado) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-4">
          <dt class="font-bold text-slate-500">Creada por</dt>
          <dd class="text-right font-black text-blue-950">{{ nombreUsuario(reserva.creadoPorUsuarioId) }}</dd>
        </div>
      </dl>

      <div class="mt-4 grid gap-3 rounded-3xl border border-blue-100 bg-white p-4 text-sm shadow-sm shadow-blue-100/60 sm:grid-cols-2">
        <div class="rounded-2xl bg-blue-50/70 p-3">
          <p class="text-xs font-black uppercase tracking-wide text-slate-500">Contacto paciente</p>
          <p class="mt-1 font-bold text-blue-950">{{ telefonoPaciente(reserva.pacienteId) || 'Sin teléfono' }}</p>
          <div class="mt-3 flex gap-2">
            <a v-if="enlaceWhatsapp(telefonoPaciente(reserva.pacienteId))" :href="enlaceWhatsapp(telefonoPaciente(reserva.pacienteId)) ?? undefined" target="_blank" rel="noopener noreferrer" class="rounded-xl border border-emerald-100 bg-white p-2 text-emerald-700 transition hover:bg-emerald-50" title="Contactar paciente por WhatsApp" aria-label="Contactar paciente por WhatsApp">
              <Icono nombre="mensaje" class="h-4 w-4" />
            </a>
            <button v-else type="button" disabled class="rounded-xl border border-slate-100 bg-white p-2 text-slate-300" title="Paciente sin teléfono para WhatsApp" aria-label="Paciente sin teléfono para WhatsApp">
              <Icono nombre="mensaje" class="h-4 w-4" />
            </button>
            <a v-if="enlaceTelefono(telefonoPaciente(reserva.pacienteId))" :href="enlaceTelefono(telefonoPaciente(reserva.pacienteId)) ?? undefined" class="rounded-xl border border-blue-100 bg-white p-2 text-blue-700 transition hover:bg-blue-50" title="Llamar paciente" aria-label="Llamar paciente">
              <Icono nombre="telefono" class="h-4 w-4" />
            </a>
            <button v-else type="button" disabled class="rounded-xl border border-slate-100 bg-white p-2 text-slate-300" title="Paciente sin teléfono para llamar" aria-label="Paciente sin teléfono para llamar">
              <Icono nombre="telefono" class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div class="rounded-2xl bg-blue-50/70 p-3">
          <p class="text-xs font-black uppercase tracking-wide text-slate-500">Contacto profesional</p>
          <p class="mt-1 font-bold text-blue-950">{{ telefonoProfesional(reserva.profesionalId) || 'Sin teléfono' }}</p>
          <div class="mt-3 flex gap-2">
            <a v-if="enlaceWhatsapp(telefonoProfesional(reserva.profesionalId))" :href="enlaceWhatsapp(telefonoProfesional(reserva.profesionalId)) ?? undefined" target="_blank" rel="noopener noreferrer" class="rounded-xl border border-emerald-100 bg-white p-2 text-emerald-700 transition hover:bg-emerald-50" title="Contactar profesional por WhatsApp" aria-label="Contactar profesional por WhatsApp">
              <Icono nombre="mensaje" class="h-4 w-4" />
            </a>
            <button v-else type="button" disabled class="rounded-xl border border-slate-100 bg-white p-2 text-slate-300" title="Profesional sin teléfono para WhatsApp" aria-label="Profesional sin teléfono para WhatsApp">
              <Icono nombre="mensaje" class="h-4 w-4" />
            </button>
            <a v-if="enlaceTelefono(telefonoProfesional(reserva.profesionalId))" :href="enlaceTelefono(telefonoProfesional(reserva.profesionalId)) ?? undefined" class="rounded-xl border border-blue-100 bg-white p-2 text-blue-700 transition hover:bg-blue-50" title="Llamar profesional" aria-label="Llamar profesional">
              <Icono nombre="telefono" class="h-4 w-4" />
            </a>
            <button v-else type="button" disabled class="rounded-xl border border-slate-100 bg-white p-2 text-slate-300" title="Profesional sin teléfono para llamar" aria-label="Profesional sin teléfono para llamar">
              <Icono nombre="telefono" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 rounded-3xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/60">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-black text-blue-950">Cambiar estado</p>
            <p class="text-xs font-semibold text-slate-500">Elegí la siguiente etapa del turno sin perder claridad visual.</p>
          </div>
          <span v-if="esEstadoTerminal(reserva.estado)" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-600">Estado final</span>
        </div>

        <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="estado in estadosReserva"
            :key="estado"
            type="button"
            :disabled="cargando || reserva.estado === estado || esEstadoTerminal(reserva.estado)"
            class="min-h-12 rounded-2xl border px-4 py-3 text-center text-sm font-black leading-tight transition disabled:cursor-not-allowed disabled:opacity-55"
            :class="reserva.estado === estado ? 'border-blue-200 bg-blue-700 text-white shadow-lg shadow-blue-700/20' : 'border-blue-100 bg-blue-50/70 text-blue-800 hover:border-blue-200 hover:bg-blue-100'"
            @click="$emit('cambiarEstado', reserva, estado)"
          >
            {{ etiquetaEstado(estado) }}
          </button>
        </div>
      </div>

      <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button v-if="!esEstadoTerminal(reserva.estado)" type="button" :disabled="cargando" class="rounded-2xl border border-red-200 bg-white px-5 py-3 font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60" @click="$emit('cancelar', reserva.id)">
          Cancelar reserva
        </button>
        <button type="button" class="rounded-2xl border border-blue-100 px-5 py-3 font-bold text-blue-800 transition hover:bg-blue-50 sm:ml-auto" @click="$emit('cerrar')">
          Cerrar
        </button>
      </div>
    </div>
  </section>
</template>
