<script setup lang="ts">
import { computed } from 'vue'
import { iconos, type NombreIcono } from '../iconos/iconos'

const props = withDefaults(defineProps<{
  nombre: NombreIcono
  tamanio?: number | string
  grosor?: number | string
  etiqueta?: string
}>(), {
  tamanio: 20,
  grosor: 2,
})

const componente = computed(() => iconos[props.nombre])
</script>

<template>
  <component
    :is="componente"
    :size="tamanio"
    :stroke-width="grosor"
    :aria-hidden="etiqueta ? undefined : 'true'"
    :aria-label="etiqueta"
  />
</template>
