<script setup lang="ts">
import AdminSidebar from '../componentes/navegacion/AdminSidebar.vue'
import SelectorTema from '../compartido/componentes/SelectorTema.vue'
import Icono from '../compartido/componentes/Icono.vue'
import type { VistaActiva, VistaNavegacion } from '../compartido/tipos/navegacion'

defineProps<{
  vistas: VistaNavegacion[]
  vistaActiva: VistaActiva
  navegacionColapsada: boolean
}>()

defineEmits<{
  cambiarVista: [vista: VistaActiva]
  alternarColapso: []
  logout: []
}>()
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar
      :vistas="vistas"
      :vista-activa="vistaActiva"
      :colapsada="navegacionColapsada"
      @cambiar-vista="$emit('cambiarVista', $event)"
      @alternar-colapso="$emit('alternarColapso')"
      @logout="$emit('logout')"
    />

    <div class="flex min-w-0 flex-1 flex-col transition-all duration-300" :class="navegacionColapsada ? 'lg:ml-16' : 'lg:ml-60'">
      <header class="flex justify-end border-b border-borde bg-superficie px-3 py-2 sm:px-4 lg:hidden">
        <SelectorTema />
      </header>
      <section class="flex-1 px-2 py-2 pb-20 sm:px-4 sm:py-4 lg:p-5">
        <slot />
      </section>

      <nav class="fixed inset-x-2 bottom-2 z-40 flex items-center gap-1 rounded-2xl border border-borde bg-superficie/95 p-1 shadow-2xl shadow-sombra/15 backdrop-blur lg:hidden" aria-label="Módulos principales">
        <button
          v-for="vista in vistas"
          :key="vista.id"
          type="button"
          class="min-h-10 flex-1 rounded-xl px-1.5 text-[10px] font-black transition focus-visible:ring-2 focus-visible:ring-foco"
          :class="vistaActiva === vista.id ? 'bg-accion text-sobre-accion' : 'text-texto-secundario hover:bg-accion-hover hover:text-sobre-accion'"
          @click="$emit('cambiarVista', vista.id)"
        >
          {{ vista.etiqueta }}
        </button>

        <button
          type="button"
          class="flex min-h-10 w-11 items-center justify-center rounded-xl border border-control bg-superficie text-texto-secundario transition hover:bg-secundaria focus-visible:ring-2 focus-visible:ring-foco"
          aria-label="Salir"
          @click="$emit('logout')"
        >
          <Icono nombre="salir" class="h-5 w-5" />
        </button>
      </nav>
    </div>
  </div>
</template>
