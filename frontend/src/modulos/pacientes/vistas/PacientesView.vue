<script setup lang="ts">
import Icono from '../../../compartido/componentes/Icono.vue'
import ModalBase from '../../../compartido/componentes/ModalBase.vue'
import ModalConfirmacion from '../../../compartido/componentes/ModalConfirmacion.vue'
import { enlaceTelefono, enlaceWhatsapp } from '../../../compartido/contacto/contacto'
import type { RespuestaPaginada } from '../../../compartido/tipos/paginacion'
import type { FiltrosPacientes } from '../servicios/pacientes-api'
import type { Paciente } from '../tipos/paciente'

interface FormularioPaciente {
  nombre: string
  apellido: string
  telefono: string
  email: string
}

defineProps<{
  respuesta: RespuestaPaginada<Paciente>
  filtros: FiltrosPacientes
  formularioPaciente: FormularioPaciente
  formularioEdicionPaciente: FormularioPaciente
  pacienteEditandoId: string
  pacienteEstadoPendiente: Paciente | null
  modalAltaAbierto: boolean
  cargando: boolean
}>()

defineEmits<{
  guardarPaciente: []
  abrirAlta: []
  cerrarAlta: []
  iniciarEdicion: [paciente: Paciente]
  cancelarEdicion: []
  guardarEdicion: []
  cambiarEstado: [paciente: Paciente]
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
          <h2 class="text-xl font-black text-blue-950">Pacientes</h2>
          <p class="text-sm text-slate-500">{{ respuesta.total }} registros encontrados. Los inactivos quedan visibles para historial, pero no se ofrecen en nuevas reservas.</p>
        </div>
        <button type="button" class="rounded-2xl bg-blue-700 px-4 py-2 font-bold text-white transition hover:bg-blue-800" @click="$emit('abrirAlta')">Agregar paciente</button>
      </div>
      <form class="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_auto]" @submit.prevent="$emit('buscar')">
        <input v-model="filtros.buscar" class="rounded-2xl border border-blue-100 px-3 py-2" placeholder="Buscar por nombre, apellido, teléfono o email" />
        <select v-model="filtros.activo" class="rounded-2xl border border-blue-100 bg-white px-3 py-2">
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <button :disabled="cargando" class="rounded-2xl bg-blue-700 px-4 py-2 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60">Buscar</button>
      </form>
      <div class="mt-5 overflow-x-auto">
        <table class="w-full min-w-[820px] text-left text-sm">
          <thead class="bg-blue-50 text-xs font-black uppercase tracking-wide text-blue-700">
            <tr>
              <th class="rounded-l-2xl px-4 py-3">Apellido</th>
              <th class="px-4 py-3">Nombre</th>
              <th class="px-4 py-3">Teléfono</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Estado</th>
              <th class="rounded-r-2xl px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-blue-50">
            <tr v-for="paciente in respuesta.datos" :key="paciente.id">
              <td class="px-4 py-3 font-black text-blue-950">{{ paciente.apellido }}</td>
              <td class="px-4 py-3 text-slate-700">{{ paciente.nombre }}</td>
              <td class="px-4 py-3 text-slate-700">{{ paciente.telefono }}</td>
              <td class="px-4 py-3 text-slate-500">{{ paciente.email || 'Sin email' }}</td>
              <td class="px-4 py-3"><span :class="paciente.activo ? 'bg-emerald-100 text-emerald-800 ring-emerald-200' : 'bg-slate-200 text-slate-600 ring-slate-300'" class="rounded-full px-3 py-1 text-xs font-black ring-1">{{ paciente.activo ? 'Activo' : 'Inactivo' }}</span></td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <a v-if="enlaceWhatsapp(paciente.telefono)" :href="enlaceWhatsapp(paciente.telefono) ?? undefined" target="_blank" rel="noopener noreferrer" class="rounded-xl border border-emerald-100 p-2 text-emerald-700 transition hover:bg-emerald-50" title="Contactar por WhatsApp" aria-label="Contactar paciente por WhatsApp">
                    <Icono nombre="mensaje" class="h-4 w-4" />
                  </a>
                  <button v-else type="button" disabled class="rounded-xl border border-slate-100 p-2 text-slate-300" title="Sin teléfono para WhatsApp" aria-label="Sin teléfono para WhatsApp">
                    <Icono nombre="mensaje" class="h-4 w-4" />
                  </button>
                  <a v-if="enlaceTelefono(paciente.telefono)" :href="enlaceTelefono(paciente.telefono) ?? undefined" class="rounded-xl border border-blue-100 p-2 text-blue-700 transition hover:bg-blue-50" title="Llamar paciente" aria-label="Llamar paciente">
                    <Icono nombre="telefono" class="h-4 w-4" />
                  </a>
                  <button v-else type="button" disabled class="rounded-xl border border-slate-100 p-2 text-slate-300" title="Sin teléfono para llamar" aria-label="Sin teléfono para llamar">
                    <Icono nombre="telefono" class="h-4 w-4" />
                  </button>
                  <button type="button" class="rounded-xl border border-blue-100 p-2 text-blue-700 transition hover:bg-blue-50" title="Editar paciente" aria-label="Editar paciente" @click="$emit('iniciarEdicion', paciente)">
                    <Icono nombre="editar" class="h-4 w-4" />
                  </button>
                  <button type="button" :disabled="cargando" :class="paciente.activo ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'" class="rounded-xl border p-2 transition disabled:opacity-60" :title="paciente.activo ? 'Desactivar paciente' : 'Activar paciente'" :aria-label="paciente.activo ? 'Desactivar paciente' : 'Activar paciente'" @click="$emit('cambiarEstado', paciente)">
                    <Icono :nombre="paciente.activo ? 'desactivar' : 'activar'" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="respuesta.datos.length === 0"><td colspan="6" class="px-4 py-8 text-center font-semibold text-slate-500">No hay pacientes para los filtros aplicados.</td></tr>
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

    <ModalBase :abierto="modalAltaAbierto" titulo="Alta de paciente" descripcion="Este formulario vive sólo en el módulo Pacientes." @cerrar="$emit('cerrarAlta')">
      <form id="form-alta-paciente" class="grid gap-3" @submit.prevent="$emit('guardarPaciente')">
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</span><input v-model="formularioPaciente.nombre" required class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Apellido</span><input v-model="formularioPaciente.apellido" required class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Teléfono</span><input v-model="formularioPaciente.telefono" required class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Email opcional</span><input v-model="formularioPaciente.email" type="email" class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
      </form>
      <template #footer>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="rounded-2xl border border-blue-100 px-4 py-3 font-bold text-blue-700" @click="$emit('cerrarAlta')">Cancelar</button>
          <button form="form-alta-paciente" :disabled="cargando" class="rounded-2xl bg-blue-700 px-4 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60">Guardar paciente</button>
        </div>
      </template>
    </ModalBase>

    <ModalBase :abierto="Boolean(pacienteEditandoId)" titulo="Editar paciente" descripcion="Actualizá los datos del paciente sin salir del listado." @cerrar="$emit('cancelarEdicion')">
      <form id="form-edicion-paciente" class="grid gap-3" @submit.prevent="$emit('guardarEdicion')">
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</span><input v-model="formularioEdicionPaciente.nombre" required minlength="2" class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Apellido</span><input v-model="formularioEdicionPaciente.apellido" required minlength="2" class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Teléfono</span><input v-model="formularioEdicionPaciente.telefono" required class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
        <label class="block"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Email opcional</span><input v-model="formularioEdicionPaciente.email" type="email" class="mt-1 w-full rounded-2xl border border-blue-100 px-3 py-2" /></label>
      </form>
      <template #footer>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="rounded-2xl border border-blue-100 px-4 py-3 font-bold text-blue-700" @click="$emit('cancelarEdicion')">Cancelar</button>
          <button form="form-edicion-paciente" :disabled="cargando || !formularioEdicionPaciente.nombre.trim() || !formularioEdicionPaciente.apellido.trim() || !formularioEdicionPaciente.telefono.trim()" class="rounded-2xl bg-blue-700 px-4 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60">Guardar cambios</button>
        </div>
      </template>
    </ModalBase>

    <ModalConfirmacion
      :abierto="Boolean(pacienteEstadoPendiente)"
      titulo="Confirmar cambio de estado"
      :mensaje="pacienteEstadoPendiente ? `¿${pacienteEstadoPendiente.activo ? 'Desactivar' : 'Activar'} paciente ${pacienteEstadoPendiente.nombre} ${pacienteEstadoPendiente.apellido}?` : ''"
      detalle="Los pacientes inactivos siguen visibles para conservar el historial, pero no se ofrecen en nuevas reservas."
      :texto-confirmar="pacienteEstadoPendiente?.activo ? 'Desactivar paciente' : 'Activar paciente'"
      :variante="pacienteEstadoPendiente?.activo ? 'advertencia' : 'exito'"
      :cargando="cargando"
      @cerrar="$emit('cancelarCambioEstado')"
      @confirmar="$emit('confirmarCambioEstado')"
    />
  </div>
</template>
