<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, type CSSProperties } from 'vue'
import Icono from '../../../compartido/componentes/Icono.vue'
import type { Reserva, EstadoReserva } from '../../reservas/tipos/reserva'
import { claveFilaAgenda, horaReferenciaActual, horaReserva, subslotsHorario, turnoReferenciaActual, type FilaAgenda, type TurnoAgendaId } from '../composables/useAgenda'

interface DiaSemana {
  fecha: Date
  iso: string
  dia: string
  numero: string
}

const props = defineProps<{
  tituloSemana: string
  diasSemana: DiaSemana[]
  filasAgenda: FilaAgenda[]
  intervaloMinutos: number
  esHoy: (diaIso: string) => boolean
  esSlotPasado: (diaIso: string, hora: string) => boolean
  reservasEnHorario: (diaIso: string, hora: string) => Reserva[]
  estiloReservaAgenda: (reserva: Reserva) => CSSProperties
  clasesBadgeEstadoReserva: (estado: EstadoReserva) => string
  nombrePacienteAgenda: (id: string) => string
  nombreEspecialidad: (id: string) => string
  etiquetaEstado: (estado: EstadoReserva) => string
  esEstadoTerminal: (estado: EstadoReserva) => boolean
  cargando: boolean
  puedeAlternarAgendaGlobal: boolean
  agendaGlobal: boolean
}>()

const emit = defineEmits<{
  cambiarSemana: [dias: number]
  irAHoy: []
  irAPendientes: []
  refrescarReservas: []
  alternarAgendaGlobal: []
  abrirModalReserva: [diaIso: string, hora: string]
  abrirDetalleReserva: [id: string]
}>()

const contenedorHoras = ref<HTMLElement | null>(null)
const filasAgendaRegistradas = new Map<string, HTMLElement>()
const horaReferencia = ref(horaReferenciaActual(new Date(), props.intervaloMinutos))
const turnoInicial = turnoReferenciaActual(new Date())
const turnosExpandidos = ref<Record<TurnoAgendaId, boolean>>({
  manana: turnoInicial === 'manana',
  tarde: turnoInicial === 'tarde',
})

const hayHoyEnRango = computed(() => props.diasSemana.some((dia) => props.esHoy(dia.iso)))
const firmaDiasSemana = computed(() => props.diasSemana.map((dia) => dia.iso).join('|'))
const estadosLeyendaReserva: EstadoReserva[] = ['PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'NO_ASISTIO', 'CANCELADA']
const filasAgendaVisibles = computed(() => props.filasAgenda.filter((fila) => fila.tipo !== 'horario' || turnosExpandidos.value[fila.turnoId]))

function esFilaHoraReferencia(hora: string) {
  return esFilaReferencia(`horario:${hora}`)
}

function esFilaReferencia(clave: string) {
  return hayHoyEnRango.value && clave === horaReferencia.value
}

function esTurnoProtegido(turnoId: TurnoAgendaId) {
  return hayHoyEnRango.value && turnoReferenciaActual(new Date()) === turnoId && !horaReferencia.value.startsWith('pausa:')
}

function alternarTurno(turnoId: TurnoAgendaId) {
  if (turnosExpandidos.value[turnoId] && esTurnoProtegido(turnoId)) return

  turnosExpandidos.value[turnoId] = !turnosExpandidos.value[turnoId]
  asegurarTurnoVisibleParaReferencia()
}

function asegurarTurnoVisibleParaReferencia() {
  const turnoReferencia = turnoReferenciaActual(new Date())

  if (horaReferencia.value.startsWith('horario:')) {
    turnosExpandidos.value[turnoReferencia] = true
    return
  }

  if (horaReferencia.value.startsWith('pausa:') && !turnosExpandidos.value.manana && !turnosExpandidos.value.tarde) {
    turnosExpandidos.value.tarde = true
  }
}

function registrarFilaAgenda(clave: string, elemento: Element | null) {
  if (elemento instanceof HTMLElement) {
    filasAgendaRegistradas.set(clave, elemento)
    return
  }

  filasAgendaRegistradas.delete(clave)
}

async function centrarHoraActual() {
  if (!hayHoyEnRango.value) return

  horaReferencia.value = horaReferenciaActual(new Date(), props.intervaloMinutos)
  asegurarTurnoVisibleParaReferencia()
  await nextTick()

  const contenedor = contenedorHoras.value
  const fila = filasAgendaRegistradas.get(horaReferencia.value)
  if (!contenedor || !fila) return

  contenedor.scrollTop = fila.offsetTop - contenedor.clientHeight / 2 + fila.clientHeight / 2
}

function irAHoyYCentrarHora() {
  emit('irAHoy')
  void centrarHoraActual()
}

function descripcionReserva(reserva: Reserva) {
  return `Ver reserva de ${props.nombrePacienteAgenda(reserva.pacienteId)}, ${props.nombreEspecialidad(reserva.especialidadId)}, estado ${props.etiquetaEstado(reserva.estado)}`
}

function subslotsFila(hora: string) {
  return subslotsHorario(hora, props.intervaloMinutos)
}

function reservasEnSubslot(diaIso: string, horaFila: string, horaSubslot: string) {
  return props.reservasEnHorario(diaIso, horaFila).filter((reserva) => horaReserva(reserva) === horaSubslot)
}

function esFilaPasada(diaIso: string, hora: string) {
  const subslots = subslotsFila(hora)
  if (subslots.length === 0) return props.esSlotPasado(diaIso, hora)

  return subslots.every((horaSubslot) => props.esSlotPasado(diaIso, horaSubslot))
}

watch(firmaDiasSemana, () => {
  void centrarHoraActual()
})

watch(() => props.intervaloMinutos, () => {
  void centrarHoraActual()
})

onMounted(() => {
  void centrarHoraActual()
})
</script>

<template>
  <div class="overflow-hidden rounded-3xl border border-borde bg-superficie text-texto shadow-xl shadow-sombra/5">
    <div class="border-b border-borde bg-superficie p-3 md:p-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-enlace">Calendario semanal</p>
          <h2 class="mt-0.5 text-xl font-black text-texto md:text-2xl">{{ tituloSemana }}</h2>
        </div>

        <div class="flex flex-wrap gap-2">
          <button v-if="puedeAlternarAgendaGlobal" type="button" class="rounded-xl border border-identidad-borde bg-superficie px-3 py-1.5 text-xs font-bold text-identidad-texto transition hover:bg-identidad-fondo" @click="$emit('alternarAgendaGlobal')">
            {{ agendaGlobal ? 'Mi agenda' : 'Ver global' }}
          </button>
          <button type="button" class="rounded-xl border border-advertencia-borde bg-advertencia-fondo px-3 py-1.5 text-xs font-bold text-advertencia-texto transition hover:bg-advertencia-suave" @click="$emit('irAPendientes')">
            Pendientes
          </button>
          <button type="button" :disabled="cargando" class="rounded-xl border border-control bg-superficie px-3 py-1.5 text-xs font-bold text-enlace transition hover:bg-secundaria disabled:opacity-60" @click="$emit('refrescarReservas')">
            Actualizar
          </button>
          <button type="button" class="rounded-xl border border-control bg-superficie px-3 py-1.5 text-xs font-bold text-enlace transition hover:bg-secundaria" @click="$emit('cambiarSemana', -7)">
            Semana anterior
          </button>
          <button type="button" class="rounded-xl bg-accion px-3 py-1.5 text-xs font-bold text-sobre-accion shadow-lg shadow-sombra/25 transition hover:bg-accion-hover" @click="irAHoyYCentrarHora">
            Hoy
          </button>
          <button type="button" class="rounded-xl border border-control bg-superficie px-3 py-1.5 text-xs font-bold text-enlace transition hover:bg-secundaria" @click="$emit('cambiarSemana', 7)">
            Semana siguiente
          </button>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Leyenda de estados de reserva">
        <span class="text-xs font-black uppercase tracking-[0.18em] text-texto-secundario">Estados</span>
        <span v-for="estado in estadosLeyendaReserva" :key="estado" class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide" :class="clasesBadgeEstadoReserva(estado)">
          <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
          {{ etiquetaEstado(estado) }}
        </span>
      </div>

    </div>

    <div class="overflow-x-auto">
      <div ref="contenedorHoras" class="max-h-[calc(100vh-7rem)] min-w-[760px] overflow-y-auto">
        <div class="sticky top-0 z-20 grid grid-cols-[64px_repeat(7,minmax(96px,1fr))] border-b border-borde bg-secundaria shadow-sm">
          <div class="sticky left-0 z-30 bg-secundaria px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-texto-secundario">Hora</div>
          <div v-for="dia in diasSemana" :key="dia.iso" class="border-l border-borde px-2 py-1.5 text-center" :class="esHoy(dia.iso) ? 'bg-accion text-sobre-accion shadow-inner' : ''">
            <p class="text-[10px] font-bold uppercase tracking-[0.16em]" :class="esHoy(dia.iso) ? 'text-sobre-accion' : 'text-texto-secundario'">{{ dia.dia }}</p>
            <p class="text-lg font-black leading-none" :class="esHoy(dia.iso) ? 'text-sobre-accion' : 'text-texto'">{{ dia.numero }}</p>
            <p v-if="esHoy(dia.iso)" class="mt-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-sobre-accion">Hoy</p>
          </div>
        </div>

        <div
          v-for="fila in filasAgendaVisibles"
          :key="claveFilaAgenda(fila)"
          :ref="(elemento) => registrarFilaAgenda(claveFilaAgenda(fila), elemento)"
          class="grid grid-cols-[64px_repeat(7,minmax(96px,1fr))] border-b border-borde last:border-b-0"
          :class="esFilaReferencia(claveFilaAgenda(fila)) ? 'relative z-10 ring-1 ring-inset ring-info-borde' : ''"
          :data-hora="fila.tipo === 'horario' ? fila.hora : undefined"
        >
          <template v-if="fila.tipo === 'turno'">
            <button
              type="button"
              class="sticky left-0 z-10 flex items-center justify-center bg-marca px-2 py-2 text-sobre-accion transition hover:bg-marca-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sobre-accion"
              :aria-expanded="turnosExpandidos[fila.id]"
              :aria-label="`${turnosExpandidos[fila.id] ? 'Colapsar' : 'Expandir'} turno ${fila.etiqueta}`"
              @click="alternarTurno(fila.id)"
            >
              <Icono nombre="siguiente" class="h-4 w-4 transition-transform duration-200" :class="turnosExpandidos[fila.id] ? 'rotate-90' : ''" :grosor="2.4" />
            </button>
            <button
              type="button"
              class="col-span-7 flex items-center justify-between border-l border-sobre-accion/30 bg-marca px-3 py-2 text-left text-sobre-accion transition hover:bg-marca-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sobre-accion"
              :aria-expanded="turnosExpandidos[fila.id]"
              @click="alternarTurno(fila.id)"
            >
              <span class="flex items-center gap-2">
                <span class="text-xs font-black uppercase tracking-[0.18em]">{{ fila.etiqueta }}</span>
                <span class="rounded-full bg-sobre-accion/15 px-2 py-0.5 text-[10px] font-bold text-sobre-accion">{{ fila.detalle }}</span>
              </span>
              <span class="text-[10px] font-black uppercase tracking-[0.16em] text-sobre-accion">{{ turnosExpandidos[fila.id] ? 'Ocultar' : 'Mostrar' }}</span>
            </button>
          </template>

          <template v-if="fila.tipo === 'pausa'">
            <div class="sticky left-0 z-10 px-2 py-1 text-[10px] font-black uppercase tracking-wide" :class="esFilaReferencia(claveFilaAgenda(fila)) ? 'bg-accion text-sobre-accion shadow-inner' : 'bg-secundaria text-texto-secundario'">{{ fila.etiqueta }}</div>
            <div class="col-span-7 border-l px-2 py-1 text-center text-[10px] font-bold" :class="esFilaReferencia(claveFilaAgenda(fila)) ? 'border-info-borde bg-info-suave text-info-texto ring-1 ring-inset ring-info-borde' : 'border-borde bg-pagina text-texto-secundario'">
              {{ fila.detalle }}
              <span v-if="esFilaReferencia(claveFilaAgenda(fila))" class="ml-2 rounded-full bg-accion px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-sobre-accion">Ahora</span>
            </div>
          </template>

          <template v-else-if="fila.tipo === 'horario'">
            <div class="sticky left-0 z-10 px-2 py-1 text-[11px] font-bold" :class="esFilaHoraReferencia(fila.hora) ? 'bg-accion text-sobre-accion shadow-inner' : 'bg-superficie text-enlace'">{{ fila.hora }}</div>
            <div
              v-for="dia in diasSemana"
              :key="`${dia.iso}-${fila.hora}`"
              class="min-h-7 border-l border-borde p-0.5 text-left align-top transition"
              :class="[
                esFilaHoraReferencia(fila.hora) ? 'bg-info-suave ring-1 ring-inset ring-info-borde' : esFilaPasada(dia.iso, fila.hora) ? 'bg-pagina text-texto-secundario' : esHoy(dia.iso) ? 'bg-info-fondo' : 'bg-superficie',
                esHoy(dia.iso) && !esFilaHoraReferencia(fila.hora) ? 'ring-1 ring-inset ring-info-borde' : '',
              ]"
            >
              <div v-if="subslotsFila(fila.hora).length === 0">
                <button
                  v-for="reserva in reservasEnHorario(dia.iso, fila.hora)"
                  :key="reserva.id"
                  type="button"
                  class="group relative mb-0.5 flex h-4 w-full items-center gap-1 rounded-full border px-1 text-left text-[10px] font-black shadow-sm transition hover:z-20 hover:-translate-y-0.5 focus:z-20 focus-visible:ring-2 focus-visible:ring-superficie"
                  :class="esEstadoTerminal(reserva.estado) ? 'line-through' : ''"
                  :style="estiloReservaAgenda(reserva)"
                  :aria-label="`${descripcionReserva(reserva)} a las ${horaReserva(reserva)}`"
                  :title="`${descripcionReserva(reserva)} a las ${horaReserva(reserva)}`"
                  @click="$emit('abrirDetalleReserva', reserva.id)"
                >
                  <span class="h-2 w-2 shrink-0 rounded-full border" :class="clasesBadgeEstadoReserva(reserva.estado)" :aria-label="etiquetaEstado(reserva.estado)"></span>
                  <span class="shrink-0 text-[8px] leading-none" aria-hidden="true">{{ horaReserva(reserva) }}</span>
                  <span class="min-w-0 truncate leading-none" aria-hidden="true">
                    {{ nombrePacienteAgenda(reserva.pacienteId).slice(0, 2).toUpperCase() }}
                  </span>
                  <span class="pointer-events-none absolute left-1/2 top-full z-30 mt-1 hidden w-max max-w-64 -translate-x-1/2 rounded-xl bg-tooltip px-2 py-1 text-[11px] font-bold leading-snug text-tooltip-texto shadow-xl group-hover:block group-focus:block">
                    {{ descripcionReserva(reserva) }} a las {{ horaReserva(reserva) }}
                  </span>
                </button>

                <div v-if="reservasEnHorario(dia.iso, fila.hora).length === 0" class="flex min-h-4 w-full items-center justify-center rounded-lg border border-dashed border-borde bg-deshabilitado px-1 text-[10px] font-semibold leading-none text-texto-deshabilitado" :aria-label="`Inicio no válido el ${dia.iso} a las ${fila.hora} para intervalo de ${intervaloMinutos} minutos`" title="Inicio no válido para este intervalo">
                  <span aria-hidden="true">-</span>
                </div>
              </div>

              <template v-else>
                <div v-for="horaSubslot in subslotsFila(fila.hora)" :key="`${dia.iso}-${horaSubslot}`" class="mb-0.5 last:mb-0">
                  <button
                    v-for="reserva in reservasEnSubslot(dia.iso, fila.hora, horaSubslot)"
                    :key="reserva.id"
                    type="button"
                    class="group relative mb-0.5 flex h-4 w-full items-center gap-1 rounded-full border px-1 text-left text-[10px] font-black shadow-sm transition hover:z-20 hover:-translate-y-0.5 focus:z-20 focus-visible:ring-2 focus-visible:ring-superficie"
                    :class="esEstadoTerminal(reserva.estado) ? 'line-through' : ''"
                    :style="estiloReservaAgenda(reserva)"
                    :aria-label="`${descripcionReserva(reserva)} a las ${horaSubslot}`"
                    :title="`${descripcionReserva(reserva)} a las ${horaSubslot}`"
                    @click="$emit('abrirDetalleReserva', reserva.id)"
                  >
                    <span class="h-2 w-2 shrink-0 rounded-full border" :class="clasesBadgeEstadoReserva(reserva.estado)" :aria-label="etiquetaEstado(reserva.estado)"></span>
                    <span class="shrink-0 text-[8px] leading-none" aria-hidden="true">{{ horaSubslot }}</span>
                    <span class="min-w-0 truncate leading-none" aria-hidden="true">
                      {{ nombrePacienteAgenda(reserva.pacienteId).slice(0, 2).toUpperCase() }}
                    </span>
                    <span class="pointer-events-none absolute left-1/2 top-full z-30 mt-1 hidden w-max max-w-64 -translate-x-1/2 rounded-xl bg-tooltip px-2 py-1 text-[11px] font-bold leading-snug text-tooltip-texto shadow-xl group-hover:block group-focus:block">
                      {{ descripcionReserva(reserva) }} a las {{ horaSubslot }}
                    </span>
                  </button>

                  <button
                    v-if="reservasEnSubslot(dia.iso, fila.hora, horaSubslot).length === 0"
                    type="button"
                    class="flex min-h-4 w-full items-center justify-center gap-1 rounded-lg border border-dashed px-1 text-[10px] font-semibold leading-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foco"
                    :class="esSlotPasado(dia.iso, horaSubslot) ? 'cursor-not-allowed border-borde bg-deshabilitado text-texto-deshabilitado' : 'border-control text-enlace hover:border-foco hover:bg-seleccion'"
                    :aria-label="`Crear reserva el ${dia.iso} a las ${horaSubslot}`"
                    :aria-disabled="esSlotPasado(dia.iso, horaSubslot)"
                    :title="esSlotPasado(dia.iso, horaSubslot) ? 'Horario pasado' : `Crear reserva ${horaSubslot}`"
                    @click="$emit('abrirModalReserva', dia.iso, horaSubslot)"
                  >
                    <span v-if="intervaloMinutos === 15" class="text-[8px] leading-none" aria-hidden="true">{{ horaSubslot }}</span>
                    <span class="inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full text-xs leading-none" aria-hidden="true">+</span>
                  </button>
                </div>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
