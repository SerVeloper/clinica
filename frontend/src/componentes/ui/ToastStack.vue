<script setup lang="ts">
import type { Toast } from '../../compartido/composables/useToasts'

defineProps<{
  toasts: Toast[]
}>()

defineEmits<{
  cerrar: [id: number]
}>()
</script>

<template>
  <section class="fixed right-4 top-4 z-[60] grid w-[min(92vw,24rem)] gap-3" aria-live="polite" aria-label="Notificaciones">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl shadow-sombra/15"
      :class="toast.tipo === 'success' ? 'bg-exito-fondo border-exito-borde text-exito-texto' : 'bg-error-fondo border-error-borde text-error-texto'"
    >
      <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" :class="toast.tipo === 'success' ? 'bg-exito-borde' : 'bg-error-borde'"></span>
      <p class="flex-1 text-sm font-bold leading-5">{{ toast.texto }}</p>
      <button type="button" class="rounded-full px-2 text-lg leading-none transition hover:bg-superficie hover:text-texto" aria-label="Cerrar notificación" @click="$emit('cerrar', toast.id)">
        x
      </button>
    </div>
  </section>
</template>
