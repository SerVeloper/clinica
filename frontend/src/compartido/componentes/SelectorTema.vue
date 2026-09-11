<script setup lang="ts">
import { computed } from 'vue'
import Icono from './Icono.vue'
import type { NombreIcono } from '../iconos/iconos'
import { useTema, type PreferenciaTema } from '../composables/useTema'

withDefaults(defineProps<{ colapsado?: boolean }>(), { colapsado: false })

const { preferencia, cambiarTema } = useTema()
const opciones = [
  { valor: 'claro', etiqueta: 'Claro', icono: 'sol' },
  { valor: 'oscuro', etiqueta: 'Oscuro', icono: 'luna' },
  { valor: 'sistema', etiqueta: 'Sistema', icono: 'monitor' },
] as const satisfies ReadonlyArray<{ valor: PreferenciaTema; etiqueta: string; icono: NombreIcono }>
const actual = computed(() => opciones.find(opcion => opcion.valor === preferencia.value) ?? opciones[2])
const siguiente = computed(() => {
  if (preferencia.value === 'claro') return opciones[1]
  if (preferencia.value === 'oscuro') return opciones[2]
  return opciones[0]
})
const ayudaCiclo = computed(() => `Tema actual: ${actual.value.etiqueta}. Cambiar a ${siguiente.value.etiqueta}`)
</script>

<template>
  <button
    v-if="colapsado"
    type="button"
    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-texto-secundario transition hover:bg-secundaria hover:text-texto focus-visible:ring-2 focus-visible:ring-foco"
    :aria-label="ayudaCiclo"
    :title="ayudaCiclo"
    @click="cambiarTema(siguiente.valor)"
  >
    <Icono :nombre="actual.icono" class="h-4 w-4 shrink-0" />
  </button>
  <div
    v-else
    role="group"
    aria-label="Preferencia de tema"
    class="inline-flex items-center gap-2 text-texto-secundario"
  >
    <span class="shrink-0 text-[11px] font-semibold uppercase tracking-wide">Apariencia</span>
    <button
      v-for="opcion in opciones"
      :key="opcion.valor"
      type="button"
      :aria-pressed="preferencia === opcion.valor"
      :aria-label="`Tema ${opcion.etiqueta}`"
      :title="`Tema actual: ${actual.etiqueta}. Seleccionar ${opcion.etiqueta}`"
      class="group flex h-11 w-11 shrink-0 items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-foco"
      @click="cambiarTema(opcion.valor)"
    >
      <span
        class="flex h-7 w-7 items-center justify-center rounded-md transition"
        :class="preferencia === opcion.valor ? 'bg-secundaria text-texto ring-1 ring-control' : 'group-hover:bg-secundaria group-hover:text-texto'"
      >
        <Icono :nombre="opcion.icono" class="h-4 w-4 shrink-0" />
      </span>
    </button>
  </div>
</template>
