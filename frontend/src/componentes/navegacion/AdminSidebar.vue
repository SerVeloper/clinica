<script setup lang="ts">
import { computed } from 'vue'
import Icono from '../../compartido/componentes/Icono.vue'
import type { NombreIcono } from '../../compartido/iconos/iconos'
import type { VistaActiva, VistaNavegacion } from '../../compartido/tipos/navegacion'
import type { Usuario } from '../../modulos/usuarios/tipos/usuario'

const props = defineProps<{
  vistas: VistaNavegacion[]
  vistaActiva: VistaActiva
  colapsada: boolean
  cantidadReservas: number
  cantidadPacientes: number
  cantidadProfesionales: number
  usuarioActual: Usuario
}>()

defineEmits<{
  cambiarVista: [vista: VistaActiva]
  alternarColapso: []
  logout: []
}>()

const nombreCompletoUsuario = computed(() => `${props.usuarioActual.apellido}, ${props.usuarioActual.nombre}`)
const iconosNavegacion = {
  activity: 'operaciones',
  briefcase: 'profesional',
  calendar: 'calendario',
  clipboard: 'especialidad',
  users: 'usuarios',
} satisfies Record<VistaNavegacion['icono'], NombreIcono>

const inicialesUsuario = computed(() => {
  const nombre = props.usuarioActual.nombre.trim().charAt(0)
  const apellido = props.usuarioActual.apellido.trim().charAt(0)
  const usuario = props.usuarioActual.usuario.slice(0, 2)

  return `${nombre}${apellido}`.trim().toUpperCase() || usuario.toUpperCase()
})
</script>

<template>
  <aside
    class="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 lg:flex"
    :class="colapsada ? 'w-16' : 'w-60'"
  >
    <div class="relative flex min-h-44 items-center justify-center p-4">
      <div v-show="!colapsada" class="flex w-full flex-col items-center text-center transition-opacity duration-200">
        <div class="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary)] text-4xl font-black text-white shadow-lg shadow-violet-900/15">
          CN
        </div>
        <p class="text-sm font-semibold text-[var(--color-text-primary)]">NIFER</p>
        <p class="mt-1 text-xs text-[var(--color-text-secondary)]">Gestión clínica</p>
      </div>

      <div v-show="colapsada" class="flex items-center justify-center transition-opacity duration-200">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white">
          CN
        </div>
      </div>

      <button
        type="button"
        class="absolute -right-3 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-primary)] text-[var(--color-surface)] transition hover:bg-[var(--color-primary-hover)] hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-300"
        :aria-label="colapsada ? 'Expandir navegación' : 'Colapsar navegación'"
        @click="$emit('alternarColapso')"
      >
        <Icono nombre="siguiente" class="h-5 w-5 transition-transform duration-300" :class="colapsada ? 'rotate-0' : 'rotate-180'" :grosor="2.4" />
      </button>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-2" aria-label="Módulos principales">
      <button
        v-for="vista in vistas"
        :key="vista.id"
        type="button"
        class="flex min-h-11 w-full items-center rounded-lg px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-violet-300"
        :class="[
          vistaActiva === vista.id ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-hover)] hover:text-white',
          colapsada ? 'justify-center' : 'gap-3 text-left',
        ]"
        :title="colapsada ? vista.etiqueta : ''"
        @click="$emit('cambiarVista', vista.id)"
      >
        <span class="flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
          <Icono :nombre="iconosNavegacion[vista.icono]" class="h-5 w-5" />
        </span>
        <span v-if="!colapsada" class="font-medium">{{ vista.etiqueta }}</span>
      </button>
    </nav>

    <div class="shrink-0 space-y-2 border-t border-[var(--color-border)] px-2 py-3">
      <div class="rounded-xl bg-slate-50 px-3 py-2 text-xs text-[var(--color-text-secondary)]" :class="colapsada ? 'flex justify-center p-2' : ''">
        <div v-if="colapsada" class="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-800 ring-1 ring-violet-200" :title="`${nombreCompletoUsuario} · ${usuarioActual.rol}`" :aria-label="`${nombreCompletoUsuario} · ${usuarioActual.rol}`">
          {{ inicialesUsuario }}
        </div>

        <div v-else class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">Sesión activa</p>
          <p class="font-black leading-tight text-[var(--color-text-primary)]">{{ nombreCompletoUsuario }}</p>
          <p class="font-semibold leading-tight text-slate-500">@{{ usuarioActual.usuario }} · {{ usuarioActual.rol }}</p>
          <div class="pt-1 text-[11px] font-bold leading-tight text-slate-500">
            <p>{{ cantidadReservas }} reservas</p>
            <p>{{ cantidadPacientes }} pacientes · {{ cantidadProfesionales }} profesionales</p>
          </div>
        </div>
      </div>
      <button
        type="button"
        class="flex min-h-10 w-full items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-300"
        :class="colapsada ? 'justify-center' : 'gap-3 text-left'"
        :title="colapsada ? 'Salir' : ''"
        :aria-label="colapsada ? 'Salir' : undefined"
        @click="$emit('logout')"
      >
        <Icono nombre="salir" class="h-5 w-5 shrink-0" />
        <span v-if="!colapsada">Salir</span>
      </button>
    </div>
  </aside>
</template>
