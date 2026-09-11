<script setup lang="ts">
import Icono from '../../../compartido/componentes/Icono.vue'
import ModalBase from '../../../compartido/componentes/ModalBase.vue'
import ModalConfirmacion from '../../../compartido/componentes/ModalConfirmacion.vue'
import { enlaceTelefono, enlaceWhatsapp } from '../../../compartido/contacto/contacto'
import type { RespuestaPaginada } from '../../../compartido/tipos/paginacion'
import type { Especialidad } from '../../especialidades/tipos/especialidad'
import type { FiltrosProfesionales } from '../servicios/profesionales-api'
import type { Profesional } from '../tipos/profesional'

interface FormularioProfesional {
  nombre: string
  apellido: string
  telefono: string
  especialidadId: string
}

defineProps<{
  respuesta: RespuestaPaginada<Profesional>
  filtros: FiltrosProfesionales
  especialidades: Especialidad[]
  especialidadesDisponibles: Especialidad[]
  formularioProfesional: FormularioProfesional
  formularioEdicionProfesional: FormularioProfesional
  profesionalEditandoId: string
  profesionalEstadoPendiente: Profesional | null
  modalAltaAbierto: boolean
  cargando: boolean
  nombreEspecialidad: (id: string) => string
}>()

defineEmits<{
  guardarProfesional: []
  abrirAlta: []
  cerrarAlta: []
  iniciarEdicion: [profesional: Profesional]
  cancelarEdicion: []
  guardarEdicion: []
  cambiarEstado: [profesional: Profesional]
  cancelarCambioEstado: []
  confirmarCambioEstado: []
  buscar: []
  cambiarPagina: [pagina: number]
}>()
</script>

<template>
  <div>
    <section class="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-900/5">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-black text-blue-950">Profesionales</h2>
          <p class="text-sm text-slate-500">{{ respuesta.total }} integrantes encontrados. Los inactivos quedan para historial, pero no se ofrecen en nuevas reservas.</p>
        </div>
        <button type="button" class="rounded-2xl bg-blue-700 px-4 py-2 font-bold text-white transition hover:bg-blue-800" @click="$emit('abrirAlta')">Agregar profesional</button>
      </div>
      <form class="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_220px_180px_auto]" @submit.prevent="$emit('buscar')">
        <input v-model="filtros.buscar" class="rounded-2xl border border-blue-100 px-3 py-2" placeholder="Buscar por nombre, apellido o teléfono" />
        <select v-model="filtros.especialidadId" class="rounded-2xl border border-blue-100 bg-white px-3 py-2">
          <option value="">Todas las especialidades</option>
          <option v-for="especialidad in especialidades" :key="especialidad.id" :value="especialidad.id">{{ especialidad.nombre }}</option>
        </select>
        <select v-model="filtros.activo" class="rounded-2xl border border-blue-100 bg-white px-3 py-2">
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <button :disabled="cargando" class="rounded-2xl bg-blue-700 px-4 py-2 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60">Buscar</button>
      </form>
      <div class="mt-5 overflow-x-auto">
        <table class="w-full min-w-[920px] text-left text-sm">
          <thead class="bg-blue-50 text-xs font-black uppercase tracking-wide text-blue-700">
            <tr>
               <th class="rounded-l-2xl px-4 py-3">Apellido</th>
               <th class="px-4 py-3">Nombre</th>
               <th class="px-4 py-3">Teléfono</th>
               <th class="px-4 py-3">Especialidad</th>
              <th class="px-4 py-3">Estado</th>
              <th class="rounded-r-2xl px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-blue-50">
            <tr v-for="profesional in respuesta.datos" :key="profesional.id">
              <td class="px-4 py-3 font-black text-blue-950">{{ profesional.apellido }}</td>
              <td class="px-4 py-3 text-slate-700">{{ profesional.nombre }}</td>
              <td class="px-4 py-3 text-slate-700">{{ profesional.telefono || 'Sin teléfono' }}</td>
              <td class="px-4 py-3 text-slate-700">{{ nombreEspecialidad(profesional.especialidadId) }}</td>
              <td class="px-4 py-3"><span :class="profesional.activo ? 'bg-emerald-100 text-emerald-800 ring-emerald-200' : 'bg-slate-200 text-slate-600 ring-slate-300'" class="rounded-full px-3 py-1 text-xs font-black ring-1">{{ profesional.activo ? 'Activo' : 'Inactivo' }}</span></td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <a v-if="enlaceWhatsapp(profesional.telefono)" :href="enlaceWhatsapp(profesional.telefono) ?? undefined" target="_blank" rel="noopener noreferrer" class="rounded-xl border border-emerald-100 p-2 text-emerald-700 transition hover:bg-emerald-50" title="Contactar por WhatsApp" aria-label="Contactar profesional por WhatsApp">
                    <Icono nombre="mensaje" class="h-4 w-4" />
                  </a>
                  <button v-else type="button" disabled class="rounded-xl border border-slate-100 p-2 text-slate-300" title="Sin teléfono para WhatsApp" aria-label="Sin teléfono para WhatsApp">
                    <Icono nombre="mensaje" class="h-4 w-4" />
                  </button>
                  <a v-if="enlaceTelefono(profesional.telefono)" :href="enlaceTelefono(profesional.telefono) ?? undefined" class="rounded-xl border border-blue-100 p-2 text-blue-700 transition hover:bg-blue-50" title="Llamar profesional" aria-label="Llamar profesional">
                    <Icono nombre="telefono" class="h-4 w-4" />
                  </a>
                  <button v-else type="button" disabled class="rounded-xl border border-slate-100 p-2 text-slate-300" title="Sin teléfono para llamar" aria-label="Sin teléfono para llamar">
                    <Icono nombre="telefono" class="h-4 w-4" />
                  </button>
                  <button type="button" class="rounded-xl border border-blue-100 p-2 text-blue-700 transition hover:bg-blue-50" title="Editar profesional" aria-label="Editar profesional" @click="$emit('iniciarEdicion', profesional)">
                    <Icono nombre="editar" class="h-4 w-4" />
                  </button>
                  <button type="button" :disabled="cargando" :class="profesional.activo ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'" class="rounded-xl border p-2 transition disabled:opacity-60" :title="profesional.activo ? 'Desactivar profesional' : 'Activar profesional'" :aria-label="profesional.activo ? 'Desactivar profesional' : 'Activar profesional'" @click="$emit('cambiarEstado', profesional)">
                    <Icono :nombre="profesional.activo ? 'desactivar' : 'activar'" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="respuesta.datos.length === 0"><td colspan="6" class="px-4 py-8 text-center font-semibold text-slate-500">No hay profesionales para los filtros aplicados.</td></tr>
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
    </section>

    <ModalBase :abierto="modalAltaAbierto" titulo="Alta de profesional" descripcion="Asociá cada profesional a una especialidad activa." @cerrar="$emit('cerrarAlta')">
      <form id="form-alta-profesional" class="grid gap-3" @submit.prevent="$emit('guardarProfesional')">
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</span><input v-model="formularioProfesional.nombre" required class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Apellido</span><input v-model="formularioProfesional.apellido" required class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Teléfono</span><input v-model="formularioProfesional.telefono" required class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Especialidad</span>
          <select v-model="formularioProfesional.especialidadId" required class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2">
            <option value="">Seleccionar especialidad</option>
            <option v-for="especialidad in especialidadesDisponibles" :key="especialidad.id" :value="especialidad.id">{{ especialidad.nombre }}</option>
          </select>
          <span v-if="especialidadesDisponibles.length === 0" class="mt-1 block text-xs font-semibold text-amber-700">No hay especialidades activas para asociar nuevos profesionales.</span>
        </label>
      </form>
      <template #footer>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="rounded-2xl border border-blue-100 px-4 py-3 font-bold text-blue-700" @click="$emit('cerrarAlta')">Cancelar</button>
          <button form="form-alta-profesional" :disabled="cargando" class="rounded-2xl bg-blue-700 px-4 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60">Guardar profesional</button>
        </div>
      </template>
    </ModalBase>

    <ModalBase :abierto="Boolean(profesionalEditandoId)" titulo="Editar profesional" descripcion="Actualizá los datos del profesional sin editar la fila inline." @cerrar="$emit('cancelarEdicion')">
      <form id="form-edicion-profesional" class="grid gap-3" @submit.prevent="$emit('guardarEdicion')">
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</span><input v-model="formularioEdicionProfesional.nombre" required minlength="2" class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Apellido</span><input v-model="formularioEdicionProfesional.apellido" required minlength="2" class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Teléfono</span><input v-model="formularioEdicionProfesional.telefono" required class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Especialidad</span>
          <select v-model="formularioEdicionProfesional.especialidadId" required class="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2">
            <option value="">Seleccionar especialidad</option>
            <option v-for="especialidad in especialidadesDisponibles" :key="especialidad.id" :value="especialidad.id">{{ especialidad.nombre }}</option>
          </select>
          <span v-if="especialidadesDisponibles.length === 0" class="mt-1 block text-xs font-semibold text-amber-700">No hay especialidades activas para asociar este profesional.</span>
        </label>
      </form>
      <template #footer>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="rounded-2xl border border-blue-100 px-4 py-3 font-bold text-blue-700" @click="$emit('cancelarEdicion')">Cancelar</button>
          <button form="form-edicion-profesional" :disabled="cargando || !formularioEdicionProfesional.nombre.trim() || !formularioEdicionProfesional.apellido.trim() || !formularioEdicionProfesional.telefono.trim() || !formularioEdicionProfesional.especialidadId" class="rounded-2xl bg-blue-700 px-4 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60">Guardar cambios</button>
        </div>
      </template>
    </ModalBase>

    <ModalConfirmacion
      :abierto="Boolean(profesionalEstadoPendiente)"
      titulo="Confirmar cambio de estado"
      :mensaje="profesionalEstadoPendiente ? `¿${profesionalEstadoPendiente.activo ? 'Desactivar' : 'Activar'} profesional ${profesionalEstadoPendiente.nombre} ${profesionalEstadoPendiente.apellido}?` : ''"
      detalle="Los profesionales inactivos siguen visibles para conservar el historial, pero no se ofrecen en nuevas reservas."
      :texto-confirmar="profesionalEstadoPendiente?.activo ? 'Desactivar profesional' : 'Activar profesional'"
      :variante="profesionalEstadoPendiente?.activo ? 'advertencia' : 'exito'"
      :cargando="cargando"
      @cerrar="$emit('cancelarCambioEstado')"
      @confirmar="$emit('confirmarCambioEstado')"
    />
  </div>
</template>
