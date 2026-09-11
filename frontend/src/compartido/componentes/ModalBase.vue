<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'

let modalesBloqueandoScroll = 0
let overflowBodyOriginal = ''

const props = withDefaults(defineProps<{
  abierto: boolean
  titulo: string
  descripcion?: string
  ancho?: string
}>(), {
  ancho: 'max-w-lg',
})

defineEmits<{
  cerrar: []
}>()

const tituloId = computed(() => `modal-${props.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'dialogo'}`)

function bloquearScrollBody() {
  if (modalesBloqueandoScroll === 0) {
    overflowBodyOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  modalesBloqueandoScroll += 1
}

function liberarScrollBody() {
  if (modalesBloqueandoScroll === 0) return
  modalesBloqueandoScroll -= 1
  if (modalesBloqueandoScroll === 0) document.body.style.overflow = overflowBodyOriginal
}

watch(
  () => props.abierto,
  (abierto, abiertoAnterior) => {
    if (abierto && !abiertoAnterior) bloquearScrollBody()
    if (!abierto && abiertoAnterior) liberarScrollBody()
  },
  { immediate: true },
)

onUnmounted(() => {
  if (props.abierto) liberarScrollBody()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="abierto" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/50 p-4" role="dialog" aria-modal="true" :aria-labelledby="tituloId">
      <div class="flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-2xl shadow-slate-950/20" :class="ancho">
        <header class="flex shrink-0 items-start justify-between gap-4 border-b border-blue-50 p-5 pb-4">
          <div>
            <h2 :id="tituloId" class="text-xl font-black text-blue-950">{{ titulo }}</h2>
            <p v-if="descripcion" class="mt-1 text-sm text-slate-500">{{ descripcion }}</p>
          </div>
          <button type="button" class="rounded-full border border-blue-100 px-3 py-1 text-sm font-black text-blue-700 transition hover:bg-blue-50" :aria-label="`Cerrar ${titulo}`" @click="$emit('cerrar')">x</button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto p-5">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="shrink-0 border-t border-blue-50 bg-white p-4">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>
