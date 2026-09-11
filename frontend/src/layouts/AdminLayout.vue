<script setup lang="ts">
import AdminSidebar from '../componentes/navegacion/AdminSidebar.vue'
import Icono from '../compartido/componentes/Icono.vue'
import type { VistaActiva, VistaNavegacion } from '../compartido/tipos/navegacion'
import type { Usuario } from '../modulos/usuarios/tipos/usuario'

defineProps<{
  vistas: VistaNavegacion[]
  vistaActiva: VistaActiva
  navegacionColapsada: boolean
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
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar
      :vistas="vistas"
      :vista-activa="vistaActiva"
      :colapsada="navegacionColapsada"
      :cantidad-reservas="cantidadReservas"
      :cantidad-pacientes="cantidadPacientes"
      :cantidad-profesionales="cantidadProfesionales"
      :usuario-actual="usuarioActual"
      @cambiar-vista="$emit('cambiarVista', $event)"
      @alternar-colapso="$emit('alternarColapso')"
      @logout="$emit('logout')"
    />

    <div class="flex min-w-0 flex-1 flex-col transition-all duration-300" :class="navegacionColapsada ? 'lg:ml-16' : 'lg:ml-60'">
      <section class="flex-1 px-2 py-2 pb-20 sm:px-4 sm:py-4 lg:p-5">
        <slot />
      </section>

      <nav class="fixed inset-x-2 bottom-2 z-40 flex items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-white/95 p-1 shadow-2xl shadow-slate-900/15 backdrop-blur lg:hidden" aria-label="Módulos principales">
        <button
          v-for="vista in vistas"
          :key="vista.id"
          type="button"
          class="min-h-10 flex-1 rounded-xl px-1.5 text-[10px] font-black transition focus:outline-none focus:ring-2 focus:ring-violet-300"
          :class="vistaActiva === vista.id ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-hover)] hover:text-white'"
          @click="$emit('cambiarVista', vista.id)"
        >
          {{ vista.etiqueta }}
        </button>

        <button
          type="button"
          class="flex min-h-10 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-300"
          aria-label="Salir"
          @click="$emit('logout')"
        >
          <Icono nombre="salir" class="h-5 w-5" />
        </button>
      </nav>
    </div>
  </div>
</template>
