<script setup lang="ts">
import Icono from './Icono.vue'
import ModalBase from './ModalBase.vue'

withDefaults(defineProps<{
  abierto: boolean
  titulo: string
  mensaje: string
  detalle?: string
  textoConfirmar?: string
  textoCancelar?: string
  cargando?: boolean
  variante?: 'advertencia' | 'exito'
}>(), {
  textoConfirmar: 'Confirmar',
  textoCancelar: 'Cancelar',
  cargando: false,
  variante: 'advertencia',
})

defineEmits<{
  cerrar: []
  confirmar: []
}>()
</script>

<template>
  <ModalBase :abierto="abierto" :titulo="titulo" ancho="max-w-md" @cerrar="$emit('cerrar')">
    <div class="flex gap-3">
      <div :class="variante === 'exito' ? 'bg-exito-suave text-exito-texto' : 'bg-advertencia-suave text-advertencia-texto'" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
        <Icono :nombre="variante === 'exito' ? 'activar' : 'desactivar'" class="h-5 w-5" />
      </div>
      <div>
        <p class="font-black text-texto">{{ mensaje }}</p>
        <p v-if="detalle" class="mt-2 text-sm leading-6 text-texto-secundario">{{ detalle }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="rounded-2xl border border-control px-4 py-3 font-bold text-enlace transition hover:bg-secundaria" @click="$emit('cerrar')">{{ textoCancelar }}</button>
        <button type="button" :disabled="cargando" :class="variante === 'exito' ? 'bg-exito-fuerte hover:bg-exito-hover' : 'bg-advertencia-fuerte hover:bg-advertencia-hover'" class="rounded-2xl px-4 py-3 font-bold text-sobre-accion shadow-lg shadow-sombra/20 transition disabled:opacity-60" @click="$emit('confirmar')">{{ textoConfirmar }}</button>
      </div>
    </template>
  </ModalBase>
</template>
