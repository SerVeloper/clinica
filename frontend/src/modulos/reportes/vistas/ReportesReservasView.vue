<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { es } from 'date-fns/locale/es'
import { format } from 'date-fns'
import '@vuepic/vue-datepicker/dist/main.css'
import type { TipoToast } from '../../../compartido/composables/useToasts'
import { useTema } from '../../../compartido/composables/useTema'
import { consultarEspecialidadesDeProfesional } from '../servicios/reportes-api'
import { useReportesReservas } from '../composables/useReportesReservas'
import type { EspecialidadProfesionalReporte, ModoPeriodoReporte } from '../tipos/reporte-reservas'
import type { Especialidad } from '../../especialidades/tipos/especialidad'
import type { Profesional } from '../../profesionales/tipos/profesional'
import type { Usuario } from '../../usuarios/tipos/usuario'

const props = defineProps<{
  usuario: Usuario
  especialidades: Especialidad[]
  profesionales: Profesional[]
  mostrarToast: (tipo: TipoToast, texto: string) => void
}>()

const { temaResuelto } = useTema()

const { borrador, resumen, consultando, exportando, errorConsulta, desactualizado, consultar, exportar } = useReportesReservas(props.mostrarToast)

const modosPeriodo: Array<{ valor: ModoPeriodoReporte; etiqueta: string }> = [
  { valor: 'FECHA', etiqueta: 'Fecha' },
  { valor: 'MES', etiqueta: 'Mes' },
  { valor: 'RANGO', etiqueta: 'Rango' },
]

const estadosReporte = [
  { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
  { valor: 'CONFIRMADA', etiqueta: 'Confirmada' },
  { valor: 'ATENDIDA', etiqueta: 'Atendida' },
  { valor: 'NO_ASISTIO', etiqueta: 'No asistió' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada' },
] as const

const esEspecialista = props.usuario.rol === 'ESPECIALISTA'
const especialidadesProfesional = ref<EspecialidadProfesionalReporte[]>([])
const cargandoEspecialidades = ref(false)

const rangoSeleccionado = ref<[Date, Date] | null>(null)
const fechaSeleccionada = ref<Date | null>(null)
const mesSeleccionado = ref<Date | null>(null)
const datePickerRango = ref<{ closeMenu: () => void } | null>(null)

// Fecha máxima seleccionable: hoy a las 23:59:59 (permite seleccionar el día actual, bloquea el futuro)
const fechaMaximaSel = (() => {
  const hoy = new Date()
  hoy.setHours(23, 59, 59, 999)
  return hoy
})()

// Formato del input del datepicker (solo fecha, sin hora)
const formatoInput = (valor: Date | Date[]): string => {
  if (Array.isArray(valor)) {
    return valor.map((fecha) => format(fecha, 'dd/MM/yyyy')).join(' — ')
  }
  return format(valor, 'dd/MM/yyyy')
}

const formatoInputMes = (valor: Date | Date[]): string => {
  const fecha = Array.isArray(valor) ? valor[0] : valor
  return format(fecha, 'MM/yyyy')
}

function aYmdLocal(fecha: Date): string {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

watch(rangoSeleccionado, (valor) => {
  if (Array.isArray(valor) && valor.length === 2 && valor[0] instanceof Date && valor[1] instanceof Date) {
    borrador.desde = aYmdLocal(valor[0])
    borrador.hasta = aYmdLocal(valor[1])
    // Rango completo: cerrar el calendario manualmente (closeOnAutoApply desactivado para que el primer click no cierre)
    nextTick(() => datePickerRango.value?.closeMenu())
  } else {
    borrador.desde = ''
    borrador.hasta = ''
  }
})

watch(fechaSeleccionada, (valor) => {
  borrador.fecha = valor instanceof Date ? aYmdLocal(valor) : ''
})

watch(mesSeleccionado, (valor) => {
  borrador.mes = valor instanceof Date ? `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, '0')}` : ''
})

const especialidadesVisibles = computed(() => {
  if (!esEspecialista) return props.especialidades
  return especialidadesProfesional.value
})

onMounted(async () => {
  if (!esEspecialista) return
  cargandoEspecialidades.value = true
  try {
    especialidadesProfesional.value = await consultarEspecialidadesDeProfesional()
    if (especialidadesProfesional.value.length === 1) {
      borrador.especialidadId = especialidadesProfesional.value[0].id
    }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudieron cargar tus especialidades'
    props.mostrarToast('error', mensaje)
  } finally {
    cargandoEspecialidades.value = false
  }
})

function nombreCompletoProfesional(profesional: Profesional): string {
  return `${profesional.apellido}, ${profesional.nombre}`
}

function formatearGeneradoEn(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}

function etiquetaModo(modo: ModoPeriodoReporte): string {
  return modosPeriodo.find((item) => item.valor === modo)?.etiqueta ?? modo
}
</script>

<template>
  <section class="space-y-5">
    <div class="rounded-[2rem] border border-borde bg-superficie p-5 shadow-xl shadow-sombra/5">
      <header class="mb-4">
        <h1 class="text-xl font-black text-texto">Reporte de reservas</h1>
        <p class="text-sm text-texto-secundario">Conteos de citas por período, estado, profesional y especialidad.</p>
      </header>

      <form class="grid gap-4" @submit.prevent="consultar()">
        <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Modo de período">
          <button
            v-for="modo in modosPeriodo"
            :key="modo.valor"
            type="button"
            class="rounded-2xl px-4 py-2 text-sm font-black transition focus-visible:ring-2 focus-visible:ring-foco"
            :class="borrador.modo === modo.valor ? 'bg-accion text-sobre-accion' : 'border border-control text-texto-secundario hover:bg-secundaria'"
            @click="borrador.modo = modo.valor"
          >
            {{ modo.etiqueta }}
          </button>
        </div>

        <div class="grid gap-3 md:grid-cols-3">
          <label v-if="borrador.modo === 'FECHA'" class="block">
            <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">Día</span>
            <VueDatePicker
              v-model="fechaSeleccionada"
              format="dd/MM/yyyy"
              :teleport="true"
              :locale="es"
              :enable-time-picker="false"
              :dark="temaResuelto === 'oscuro'"
              :max-date="fechaMaximaSel"
              :formats="{ input: formatoInput }"
              auto-apply
              :action-row="{ showCancel: false }"
              class="mt-1"
              @keydown.enter.prevent
            />
          </label>

          <label v-if="borrador.modo === 'MES'" class="block">
            <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">Mes</span>
            <VueDatePicker
              v-model="mesSeleccionado"
              month-picker
              format="MM/yyyy"
              :teleport="true"
              :locale="es"
              :dark="temaResuelto === 'oscuro'"
              :max-date="fechaMaximaSel"
              :formats="{ input: formatoInputMes }"
              auto-apply
              :action-row="{ showCancel: false }"
              class="mt-1"
              @keydown.enter.prevent
            />
          </label>

          <label v-if="borrador.modo === 'RANGO'" class="block">
            <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">Rango de fechas</span>
            <VueDatePicker
              ref="datePickerRango"
              v-model="rangoSeleccionado"
              range
              :teleport="true"
              :locale="es"
              :enable-time-picker="false"
              :dark="temaResuelto === 'oscuro'"
              :max-date="fechaMaximaSel"
              :formats="{ input: formatoInput }"
              auto-apply
              :range="{ partialRange: false }"
              :config="{ closeOnAutoApply: false }"
              :action-row="{ showSelect: false, showCancel: false }"
              class="mt-1"
              @keydown.enter.prevent
            />
          </label>

          <label class="block">
            <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">Estado</span>
            <select v-model="borrador.estado" class="mt-1 w-full rounded-2xl border border-control bg-superficie px-3 py-2 shadow-sm">
              <option value="">Todos</option>
              <option v-for="estado in estadosReporte" :key="estado.valor" :value="estado.valor">{{ estado.etiqueta }}</option>
            </select>
          </label>

          <label class="block">
            <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">
              {{ esEspecialista ? 'Mis especialidades' : 'Especialidad' }}
            </span>
            <select v-model="borrador.especialidadId" class="mt-1 w-full rounded-2xl border border-control bg-superficie px-3 py-2 shadow-sm">
              <option value="">
                {{ esEspecialista ? (cargandoEspecialidades ? 'Cargando…' : 'Todas las mías') : 'Todas' }}
              </option>
              <option v-for="especialidad in especialidadesVisibles" :key="especialidad.id" :value="especialidad.id">
                {{ especialidad.nombre }}
              </option>
            </select>
          </label>

          <label v-if="!esEspecialista" class="block">
            <span class="text-xs font-bold uppercase tracking-wide text-texto-secundario">Profesional</span>
            <select v-model="borrador.profesionalId" class="mt-1 w-full rounded-2xl border border-control bg-superficie px-3 py-2 shadow-sm">
              <option value="">Todos</option>
              <option v-for="profesional in profesionales" :key="profesional.id" :value="profesional.id">{{ nombreCompletoProfesional(profesional) }}</option>
            </select>
          </label>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs font-semibold text-texto-secundario">Fechas calendario (UTC)</p>
          <button
            type="submit"
            :disabled="consultando"
            class="rounded-2xl bg-accion px-6 py-2.5 font-black text-sobre-accion transition hover:bg-accion-hover disabled:opacity-60"
          >
            {{ consultando ? 'Consultando…' : 'Consultar' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="errorConsulta" class="rounded-2xl border border-ausente-borde bg-ausente-fondo px-4 py-3 text-sm font-semibold text-ausente-texto">
      {{ errorConsulta }}
    </div>

    <div v-if="resumen" class="space-y-5">
      <div v-if="desactualizado" class="rounded-2xl border border-advertencia-borde bg-advertencia-fondo px-4 py-3 text-sm font-semibold text-advertencia-texto">
        Resultados desactualizados: consultá de nuevo antes de exportar.
      </div>

      <div class="rounded-[2rem] border border-borde bg-superficie p-5 shadow-xl shadow-sombra/5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-sm font-bold text-texto-secundario">
              {{ etiquetaModo(resumen.periodo.modo) }} · {{ resumen.periodo.desde }} a {{ resumen.periodo.hasta }} ({{ resumen.periodo.zona }})
            </p>
            <p class="mt-1 text-xs text-texto-secundario">Generado el {{ formatearGeneradoEn(resumen.generadoEn) }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              :disabled="desactualizado || consultando || exportando !== null"
              class="rounded-2xl border border-exito-borde bg-exito-fondo px-4 py-2 text-sm font-black text-exito-texto transition hover:bg-exito-suave disabled:opacity-60"
              @click="exportar('excel')"
            >
              {{ exportando === 'excel' ? 'Exportando…' : 'Exportar Excel' }}
            </button>
            <button
              type="button"
              :disabled="desactualizado || consultando || exportando !== null"
              class="rounded-2xl border border-info-borde bg-info-fondo px-4 py-2 text-sm font-black text-info-texto transition hover:bg-info-suave disabled:opacity-60"
              @click="exportar('pdf')"
            >
              {{ exportando === 'pdf' ? 'Exportando…' : 'Exportar PDF' }}
            </button>
          </div>
        </div>

        <div v-if="resumen.total === 0" class="mt-4 rounded-2xl border border-borde bg-secundaria px-4 py-3 text-sm font-semibold text-texto-secundario">
          Sin coincidencias para los filtros consultados: total y desgloses en cero.
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl border border-info-borde bg-info-fondo p-4">
            <p class="text-xs font-black uppercase tracking-wide text-info-texto">Total de citas</p>
            <p class="mt-1 text-3xl font-black text-texto">{{ resumen.total }}</p>
          </div>
          <div class="rounded-2xl border border-exito-borde bg-exito-fondo p-4">
            <p class="text-xs font-black uppercase tracking-wide text-exito-texto">Concretadas (ATENDIDA)</p>
            <p class="mt-1 text-3xl font-black text-texto">{{ resumen.concretadas }}</p>
          </div>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-3">
          <div class="overflow-x-auto rounded-2xl border border-borde">
            <table class="w-full text-left text-sm">
              <thead class="bg-secundaria text-xs font-black uppercase tracking-wide text-enlace">
                <tr>
                  <th class="px-4 py-3">Estado</th>
                  <th class="px-4 py-3 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-borde">
                <tr v-for="fila in resumen.porEstado" :key="fila.estado">
                  <td class="px-4 py-3 font-semibold text-texto">{{ fila.estado }}</td>
                  <td class="px-4 py-3 text-right font-black text-texto">{{ fila.cantidad }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-borde">
            <table class="w-full text-left text-sm">
              <thead class="bg-secundaria text-xs font-black uppercase tracking-wide text-enlace">
                <tr>
                  <th class="px-4 py-3">Profesional</th>
                  <th class="px-4 py-3 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-borde">
                <tr v-for="(fila, indice) in resumen.porProfesional" :key="`${fila.id ?? 'no-disponible'}-${indice}`">
                  <td class="px-4 py-3 font-semibold text-texto">{{ fila.nombre }}</td>
                  <td class="px-4 py-3 text-right font-black text-texto">{{ fila.cantidad }}</td>
                </tr>
                <tr v-if="resumen.porProfesional.length === 0">
                  <td colspan="2" class="px-4 py-6 text-center font-semibold text-texto-secundario">Sin datos</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-borde">
            <table class="w-full text-left text-sm">
              <thead class="bg-secundaria text-xs font-black uppercase tracking-wide text-enlace">
                <tr>
                  <th class="px-4 py-3">Especialidad</th>
                  <th class="px-4 py-3 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-borde">
                <tr v-for="(fila, indice) in resumen.porEspecialidad" :key="`${fila.id ?? 'no-disponible'}-${indice}`">
                  <td class="px-4 py-3 font-semibold text-texto">{{ fila.nombre }}</td>
                  <td class="px-4 py-3 text-right font-black text-texto">{{ fila.cantidad }}</td>
                </tr>
                <tr v-if="resumen.porEspecialidad.length === 0">
                  <td colspan="2" class="px-4 py-6 text-center font-semibold text-texto-secundario">Sin datos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="consultando" class="rounded-[2rem] border border-borde bg-superficie p-10 text-center text-sm font-semibold text-texto-secundario shadow-xl shadow-sombra/5">
      Consultando el reporte…
    </div>
  </section>
</template>

<style scoped>
:deep(.dp__main) {
  width: 100%;
}

:deep(.dp__input) {
  border-radius: 1rem;
  border: 1px solid var(--tema-borde);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  position: relative;
  min-width: 260px;
  color: var(--tema-texto);
  background-color: var(--tema-superficie);
}

:deep(.dp__input::placeholder) {
  color: var(--tema-texto-secundario);
}
</style>