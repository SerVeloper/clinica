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
      class="flex items-start gap-3 rounded-2xl border bg-white/95 px-4 py-3 shadow-2xl shadow-blue-950/15 backdrop-blur"
      :class="toast.tipo === 'success' ? 'border-emerald-200 text-emerald-900' : 'border-red-200 text-red-900'"
    >
      <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" :class="toast.tipo === 'success' ? 'bg-emerald-500' : 'bg-red-500'"></span>
      <p class="flex-1 text-sm font-bold leading-5">{{ toast.texto }}</p>
      <button type="button" class="rounded-full px-2 text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar notificación" @click="$emit('cerrar', toast.id)">
        x
      </button>
    </div>
  </section>
</template>
