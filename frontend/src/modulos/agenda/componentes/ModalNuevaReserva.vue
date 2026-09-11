<script setup lang="ts">
import type { Especialidad } from '../../especialidades/tipos/especialidad'
import type { Paciente } from '../../pacientes/tipos/paciente'
import type { Profesional } from '../../profesionales/tipos/profesional'

interface FormularioReserva {
  pacienteId: string
  profesionalId: string
  especialidadId: string
  fechaInicio: string
}

interface FormularioPacienteReserva {
  nombre: string
  apellido: string
  telefono: string
  email: string
}

defineProps<{
  abierto: boolean
  cargando: boolean
  mostrarCrearPaciente: boolean
  formularioReserva: FormularioReserva
  formularioPacienteReserva: FormularioPacienteReserva
  pacientes: Paciente[]
  profesionalesFiltrados: Profesional[]
  especialidades: Especialidad[]
  profesionalFijo: boolean
  duracionReservaMinutos: number
}>()

defineEmits<{
  cerrar: []
  guardarReserva: []
  alternarCrearPaciente: []
  cancelarAltaPaciente: []
  guardarPaciente: []
  ajustarProfesional: []
}>()
</script>

<template>
  <section v-if="abierto" class="fixed inset-0 z-50 grid place-items-center bg-blue-950/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-reserva" @click.self="$emit('cerrar')">
    <form class="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/80 bg-white p-6 shadow-2xl shadow-blue-950/30 md:p-8" @submit.prevent="$emit('guardarReserva')">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.22em] text-blue-700">Nueva reserva</p>
          <h2 id="titulo-modal-reserva" class="mt-2 text-3xl font-black text-blue-950">Completar turno</h2>
          <p class="mt-2 text-sm text-slate-500">Se enviará al endpoint de reservas con paciente, profesional, especialidad y fecha de inicio.</p>
        </div>
        <button type="button" class="rounded-full border border-blue-100 px-4 py-3 text-blue-700 transition hover:bg-blue-50" aria-label="Cerrar modal" @click="$emit('cerrar')">
          x
        </button>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <label class="block md:col-span-2">
          <span class="text-sm font-bold text-slate-700">Fecha y hora</span>
          <input v-model="formularioReserva.fechaInicio" required type="datetime-local" :step="duracionReservaMinutos * 60" class="mt-1 w-full rounded-2xl border border-blue-100 px-4 py-3 shadow-sm" />
          <span class="mt-1 block text-xs font-semibold text-slate-500">Horarios válidos: 08:00-12:00 y 16:00-20:00, cada {{ duracionReservaMinutos }} minutos. No se admiten turnos pasados.</span>
        </label>

        <div class="md:col-span-2">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <label class="block flex-1">
              <span class="text-sm font-bold text-slate-700">Paciente</span>
              <select v-model="formularioReserva.pacienteId" required class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
                <option value="">Seleccionar paciente</option>
                <option v-for="paciente in pacientes" :key="paciente.id" :value="paciente.id">{{ paciente.apellido }}, {{ paciente.nombre }}</option>
              </select>
            </label>
            <button type="button" class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800 transition hover:bg-blue-100" @click="$emit('alternarCrearPaciente')">
              {{ mostrarCrearPaciente ? 'Ocultar alta' : 'Crear paciente' }}
            </button>
          </div>

          <div v-if="mostrarCrearPaciente" class="mt-3 rounded-3xl border border-blue-100 bg-blue-50/80 p-4">
            <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="font-black text-blue-950">Alta rápida de paciente</h3>
                <p class="text-sm text-slate-600">Crealo sin salir del turno; al guardar queda seleccionado automáticamente.</p>
              </div>
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <label class="block">
                <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</span>
                <input v-model="formularioPacienteReserva.nombre" class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2" />
              </label>
              <label class="block">
                <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Apellido</span>
                <input v-model="formularioPacienteReserva.apellido" class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2" />
              </label>
              <label class="block">
                <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Teléfono</span>
                <input v-model="formularioPacienteReserva.telefono" class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2" />
              </label>
              <label class="block">
                <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Email opcional</span>
                <input v-model="formularioPacienteReserva.email" type="email" class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2" />
              </label>
            </div>

            <div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" class="rounded-2xl border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-800 transition hover:bg-blue-50" @click="$emit('cancelarAltaPaciente')">
                Cancelar alta
              </button>
              <button type="button" :disabled="cargando || !formularioPacienteReserva.nombre || !formularioPacienteReserva.apellido || !formularioPacienteReserva.telefono" class="rounded-2xl bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:opacity-60" @click="$emit('guardarPaciente')">
                Guardar y seleccionar
              </button>
            </div>
          </div>
        </div>

        <label class="block">
          <span class="text-sm font-bold text-slate-700">Especialidad</span>
          <select v-model="formularioReserva.especialidadId" required class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm" @change="$emit('ajustarProfesional')">
            <option value="">Seleccionar especialidad</option>
            <option v-for="especialidad in especialidades" :key="especialidad.id" :value="especialidad.id">{{ especialidad.nombre }} · {{ especialidad.duracionMinutos }} min</option>
          </select>
        </label>

        <label class="block">
          <span class="text-sm font-bold text-slate-700">Profesional</span>
          <select v-model="formularioReserva.profesionalId" required :disabled="profesionalFijo" class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm disabled:bg-slate-100 disabled:text-slate-500">
            <option value="">Seleccionar profesional</option>
            <option v-for="profesional in profesionalesFiltrados" :key="profesional.id" :value="profesional.id">{{ profesional.apellido }}, {{ profesional.nombre }}</option>
          </select>
          <span v-if="profesionalFijo" class="mt-1 block text-xs font-semibold text-slate-500">Tu usuario especialista sólo puede crear reservas para este profesional.</span>
        </label>
      </div>

      <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" class="rounded-2xl border border-blue-100 px-5 py-3 font-bold text-blue-800 transition hover:bg-blue-50" @click="$emit('cerrar')">
          Cancelar
        </button>
        <button :disabled="cargando" class="rounded-2xl bg-blue-700 px-6 py-3 font-bold text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 disabled:opacity-60">
          Crear reserva
        </button>
      </div>
    </form>
  </section>
</template>
