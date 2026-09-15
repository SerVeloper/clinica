<script setup lang="ts">
import { ref, watch } from 'vue'
import Icono from '../../compartido/componentes/Icono.vue'
import SelectorTema from '../../compartido/componentes/SelectorTema.vue'
import type { NombreIcono } from '../../compartido/iconos/iconos'
import type { VistaActiva, VistaNavegacion } from '../../compartido/tipos/navegacion'

const props = defineProps<{
  vistas: VistaNavegacion[]
  vistaActiva: VistaActiva
  colapsada: boolean
}>()

const emit = defineEmits<{
  cambiarVista: [vista: VistaActiva]
  alternarColapso: []
  logout: []
}>()

const iconosNavegacion = {
  ajustes: 'ajustes',
  briefcase: 'profesional',
  calendar: 'calendario',
  clipboard: 'especialidad',
  reporte: 'reporte',
  users: 'usuarios',
} satisfies Record<VistaNavegacion['icono'], NombreIcono>

const expandidas = ref<Set<string>>(new Set())

watch(
  () => props.vistaActiva,
  (activa) => {
    const siguiente = new Set(expandidas.value)
    for (const vista of props.vistas) {
      if (vista.hijos?.length && activa.startsWith(`${vista.id}-`)) siguiente.add(vista.id)
    }
    expandidas.value = siguiente
  },
  { immediate: true },
)

function expandida(vista: VistaNavegacion): boolean {
  return expandidas.value.has(vista.id)
}

function alternarExpansion(vista: VistaNavegacion) {
  const siguiente = new Set(expandidas.value)
  if (siguiente.has(vista.id)) siguiente.delete(vista.id)
  else siguiente.add(vista.id)
  expandidas.value = siguiente
}

function esActiva(vista: VistaNavegacion): boolean {
  return props.vistaActiva === vista.id || (!!vista.hijos?.length && props.vistaActiva.startsWith(`${vista.id}-`))
}

function manejarClickVista(vista: VistaNavegacion) {
  if (vista.hijos?.length && !props.colapsada) {
    alternarExpansion(vista)
    return
  }
  emit('cambiarVista', vista.id)
}
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
      <template v-for="vista in vistas" :key="vista.id">
        <button
          type="button"
          class="flex min-h-11 w-full items-center rounded-lg px-3 py-2 text-sm transition focus-visible:ring-2 focus-visible:ring-foco"
          :class="[
            esActiva(vista) ? 'bg-accion text-sobre-accion' : 'text-texto-secundario hover:bg-accion-hover hover:text-sobre-accion',
            colapsada ? 'justify-center' : 'gap-3 text-left',
          ]"
          :title="colapsada ? vista.etiqueta : ''"
          :aria-expanded="vista.hijos?.length ? expandida(vista) : undefined"
          :aria-current="esActiva(vista) ? 'page' : undefined"
          @click="manejarClickVista(vista)"
        >
          <span class="flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
            <Icono :nombre="iconosNavegacion[vista.icono]" class="h-5 w-5" />
          </span>
          <template v-if="!colapsada">
            <span class="min-w-0 flex-1 truncate font-medium">{{ vista.etiqueta }}</span>
            <Icono
              v-if="vista.hijos?.length"
              nombre="siguiente"
              class="h-4 w-4 shrink-0 transition-transform duration-300"
              :class="expandida(vista) ? 'rotate-90' : 'rotate-0'"
            />
          </template>
        </button>

        <div
          v-if="!colapsada && vista.hijos?.length && expandida(vista)"
          class="mt-1 space-y-1 pl-[1.15rem]"
          role="list"
        >
          <button
            v-for="hijo in vista.hijos"
            :key="hijo.id"
            type="button"
            class="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition focus-visible:ring-2 focus-visible:ring-foco"
            :class="vistaActiva === hijo.id ? 'bg-accion text-sobre-accion' : 'text-texto-secundario hover:bg-accion-hover hover:text-sobre-accion'"
            :aria-current="vistaActiva === hijo.id ? 'page' : undefined"
            @click="emit('cambiarVista', hijo.id)"
          >
            <span class="flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
              <Icono :nombre="hijo.icono" class="h-5 w-5" />
            </span>
            <span class="truncate font-medium">{{ hijo.etiqueta }}</span>
          </button>
        </div>
      </template>
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
