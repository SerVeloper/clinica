<script setup lang="ts">
import Icono from '../../../compartido/componentes/Icono.vue'
import ModalBase from '../../../compartido/componentes/ModalBase.vue'
import ModalConfirmacion from '../../../compartido/componentes/ModalConfirmacion.vue'
import type { RespuestaPaginada } from '../../../compartido/tipos/paginacion'
import type { Especialidad } from '../tipos/especialidad'
import type { ActualizarEspecialidadPayload, CrearEspecialidadPayload, FiltrosEspecialidades } from '../servicios/especialidades-api'

const duracionesDisponibles = [
  { valor: 15, etiqueta: '15 min · Medicina' },
  { valor: 30, etiqueta: '30 min · Odontología' },
  { valor: 60, etiqueta: '60 min · Fisioterapia' },
] as const

defineProps<{
  respuesta: RespuestaPaginada<Especialidad>
  filtros: FiltrosEspecialidades
  formularioEspecialidad: CrearEspecialidadPayload
  formularioEdicionEspecialidad: ActualizarEspecialidadPayload
  especialidadEditandoId: string
  especialidadEstadoPendiente: Especialidad | null
  modalAltaAbierto: boolean
  cargando: boolean
}>()

defineEmits<{
  guardarEspecialidad: []
  abrirAlta: []
  cerrarAlta: []
  iniciarEdicion: [especialidad: Especialidad]
  cancelarEdicion: []
  guardarEdicion: []
  cambiarEstado: [especialidad: Especialidad]
  cancelarCambioEstado: []
  confirmarCambioEstado: []
  buscar: []
  cambiarPagina: [pagina: number]
}>()
</script>

<template>
  <section>
    <div class="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-900/5">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-black text-blue-950">Especialidades</h2>
          <p class="mt-1 text-sm text-slate-500">{{ respuesta.total }} registros encontrados. Las inactivas se conservan para historial, pero no se ofrecen en nuevas reservas.</p>
        </div>
        <button type="button" class="rounded-2xl bg-blue-700 px-4 py-2 font-bold text-white transition hover:bg-blue-800" @click="$emit('abrirAlta')">Agregar especialidad</button>
      </div>
      <form class="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_auto]" @submit.prevent="$emit('buscar')">
        <input v-model="filtros.buscar" class="rounded-2xl border border-blue-100 px-3 py-2" placeholder="Buscar por nombre" />
        <select v-model="filtros.activo" class="rounded-2xl border border-blue-100 bg-white px-3 py-2">
          <option value="">Todas</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
        <button :disabled="cargando" class="rounded-2xl bg-blue-700 px-4 py-2 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60">Buscar</button>
      </form>
      <div class="mt-5 overflow-x-auto">
        <table class="w-full min-w-[720px] text-left text-sm">
          <thead class="bg-blue-50 text-xs font-black uppercase tracking-wide text-blue-700">
            <tr>
              <th class="rounded-l-2xl px-4 py-3">Nombre</th>
              <th class="px-4 py-3">Duración</th>
              <th class="px-4 py-3">Estado</th>
              <th class="rounded-r-2xl px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-blue-50">
            <tr v-for="especialidad in respuesta.datos" :key="especialidad.id">
              <td class="px-4 py-3 font-black text-blue-950">{{ especialidad.nombre }}</td>
              <td class="px-4 py-3 text-slate-700">{{ especialidad.duracionMinutos }} minutos</td>
              <td class="px-4 py-3">
                <span :class="especialidad.activo ? 'bg-emerald-100 text-emerald-800 ring-emerald-200' : 'bg-slate-200 text-slate-600 ring-slate-300'" class="rounded-full px-3 py-1 text-xs font-black ring-1">
                  {{ especialidad.activo ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button type="button" class="rounded-xl border border-blue-100 p-2 text-blue-700 transition hover:bg-blue-50" title="Editar especialidad" aria-label="Editar especialidad" @click="$emit('iniciarEdicion', especialidad)">
                    <Icono nombre="editar" class="h-4 w-4" />
                  </button>
                  <button type="button" :disabled="cargando" :class="especialidad.activo ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'" class="rounded-xl border p-2 transition disabled:opacity-60" :title="especialidad.activo ? 'Desactivar especialidad' : 'Activar especialidad'" :aria-label="especialidad.activo ? 'Desactivar especialidad' : 'Activar especialidad'" @click="$emit('cambiarEstado', especialidad)">
                    <Icono :nombre="especialidad.activo ? 'desactivar' : 'activar'" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="respuesta.datos.length === 0">
              <td colspan="4" class="px-4 py-8 text-center font-semibold text-slate-500">No hay especialidades para los filtros aplicados.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer class="mt-4 flex flex-col gap-3 border-t border-blue-50 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>Página {{ respuesta.pagina }} de {{ respuesta.totalPaginas }}</span>
        <div class="flex gap-2">
          <button type="button" :disabled="cargando || respuesta.pagina <= 1" class="rounded-xl border border-blue-100 px-3 py-2 font-bold text-blue-700 disabled:opacity-50" @click="$emit('cambiarPagina', respuesta.pagina - 1)">Anterior</button>
          <button type="button" :disabled="cargando || respuesta.pagina >= respuesta.totalPaginas" class="rounded-xl border border-blue-100 px-3 py-2 font-bold text-blue-700 disabled:opacity-50" @click="$emit('cambiarPagina', respuesta.pagina + 1)">Siguiente</button>
        </div>
      </footer>
    </div>

    <ModalBase :abierto="modalAltaAbierto" titulo="Definir duración" descripcion="La agenda y la validación de reservas usan esta duración para los inicios permitidos." @cerrar="$emit('cerrarAlta')">
      <form id="form-alta-especialidad" class="grid gap-3" @submit.prevent="$emit('guardarEspecialidad')">
        <label class="block">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</span>
          <input v-model="formularioEspecialidad.nombre" required minlength="2" class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2 shadow-sm" placeholder="Ej: Fisioterapia" />
        </label>
        <label class="block">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Duración del turno</span>
          <select v-model.number="formularioEspecialidad.duracionMinutos" required class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2 shadow-sm">
            <option v-for="duracion in duracionesDisponibles" :key="duracion.valor" :value="duracion.valor">{{ duracion.etiqueta }}</option>
          </select>
        </label>
      </form>
      <template #footer>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="rounded-2xl border border-blue-100 px-4 py-3 font-bold text-blue-700" @click="$emit('cerrarAlta')">Cancelar</button>
          <button form="form-alta-especialidad" :disabled="cargando || !formularioEspecialidad.nombre.trim()" class="rounded-2xl bg-blue-700 px-5 py-3 font-bold text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 disabled:opacity-60">Guardar especialidad</button>
        </div>
      </template>
    </ModalBase>

    <ModalBase :abierto="Boolean(especialidadEditandoId)" titulo="Editar especialidad" descripcion="Actualizá el nombre o la duración del turno sin editar inline." @cerrar="$emit('cancelarEdicion')">
      <form id="form-edicion-especialidad" class="grid gap-3" @submit.prevent="$emit('guardarEdicion')">
        <label class="block">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</span>
          <input v-model="formularioEdicionEspecialidad.nombre" required minlength="2" class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2 shadow-sm" />
        </label>
        <label class="block">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Duración del turno</span>
          <select v-model.number="formularioEdicionEspecialidad.duracionMinutos" required class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2 shadow-sm">
            <option v-for="duracion in duracionesDisponibles" :key="duracion.valor" :value="duracion.valor">{{ duracion.etiqueta }}</option>
          </select>
        </label>
      </form>
      <template #footer>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="rounded-2xl border border-blue-100 px-4 py-3 font-bold text-blue-700" @click="$emit('cancelarEdicion')">Cancelar</button>
          <button form="form-edicion-especialidad" :disabled="cargando || !formularioEdicionEspecialidad.nombre.trim()" class="rounded-2xl bg-blue-700 px-5 py-3 font-bold text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 disabled:opacity-60">Guardar cambios</button>
        </div>
      </template>
    </ModalBase>

    <ModalConfirmacion
      :abierto="Boolean(especialidadEstadoPendiente)"
      titulo="Confirmar cambio de estado"
      :mensaje="especialidadEstadoPendiente ? `¿${especialidadEstadoPendiente.activo ? 'Desactivar' : 'Activar'} especialidad ${especialidadEstadoPendiente.nombre}?` : ''"
      detalle="Las especialidades inactivas siguen visibles para conservar el historial, pero no se ofrecen en nuevas reservas."
      :texto-confirmar="especialidadEstadoPendiente?.activo ? 'Desactivar especialidad' : 'Activar especialidad'"
      :variante="especialidadEstadoPendiente?.activo ? 'advertencia' : 'exito'"
      :cargando="cargando"
      @cerrar="$emit('cancelarCambioEstado')"
      @confirmar="$emit('confirmarCambioEstado')"
    />
  </section>
</template>
