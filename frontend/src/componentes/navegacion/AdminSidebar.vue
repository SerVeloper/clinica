<script setup lang="ts">
import Icono from '../../compartido/componentes/Icono.vue'
import SelectorTema from '../../compartido/componentes/SelectorTema.vue'
import type { NombreIcono } from '../../compartido/iconos/iconos'
import type { VistaActiva, VistaNavegacion } from '../../compartido/tipos/navegacion'

defineProps<{
  vistas: VistaNavegacion[]
  vistaActiva: VistaActiva
  colapsada: boolean
}>()

defineEmits<{
  cambiarVista: [vista: VistaActiva]
  alternarColapso: []
  logout: []
}>()

const iconosNavegacion = {
  activity: 'operaciones',
  briefcase: 'profesional',
  calendar: 'calendario',
  clipboard: 'especialidad',
  users: 'usuarios',
} satisfies Record<VistaNavegacion['icono'], NombreIcono>

</script>

<template>
  <aside
    class="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-borde bg-superficie transition-all duration-300 lg:flex"
    :class="colapsada ? 'w-16' : 'w-60'"
  >
    <div class="relative flex min-h-44 items-center justify-center p-4">
      <div v-show="!colapsada" class="flex w-full flex-col items-center text-center transition-opacity duration-200">
        <div class="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-accion text-4xl font-black text-sobre-accion shadow-lg shadow-sombra/15">
          CN
        </div>
        <p class="text-sm font-semibold text-texto">NIFER</p>
        <p class="mt-1 text-xs text-texto-secundario">Gestión clínica</p>
      </div>

      <div v-show="colapsada" class="flex items-center justify-center transition-opacity duration-200">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-accion text-lg font-bold text-sobre-accion">
          CN
        </div>
      </div>

      <button
        type="button"
        class="absolute -right-3 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-control bg-accion text-sobre-accion transition hover:bg-accion-hover focus-visible:ring-2 focus-visible:ring-foco"
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
        class="flex min-h-11 w-full items-center rounded-lg px-3 py-2 text-sm transition focus-visible:ring-2 focus-visible:ring-foco"
        :class="[
          vistaActiva === vista.id ? 'bg-accion text-sobre-accion' : 'text-texto-secundario hover:bg-accion-hover hover:text-sobre-accion',
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

    <div class="shrink-0 space-y-2 border-t border-borde px-2 py-3">
      <div class="flex justify-center">
        <SelectorTema :colapsado="colapsada" />
      </div>
      <button
        type="button"
        class="flex min-h-10 w-full items-center rounded-lg border border-control bg-superficie px-3 py-2 text-sm font-bold text-texto-secundario transition hover:bg-secundaria focus-visible:ring-2 focus-visible:ring-foco"
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
