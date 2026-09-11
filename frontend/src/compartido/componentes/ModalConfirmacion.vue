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
      <div :class="variante === 'exito' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
        <Icono :nombre="variante === 'exito' ? 'activar' : 'desactivar'" class="h-5 w-5" />
      </div>
      <div>
        <p class="font-black text-blue-950">{{ mensaje }}</p>
        <p v-if="detalle" class="mt-2 text-sm leading-6 text-slate-500">{{ detalle }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="rounded-2xl border border-blue-100 px-4 py-3 font-bold text-blue-700 transition hover:bg-blue-50" @click="$emit('cerrar')">{{ textoCancelar }}</button>
        <button type="button" :disabled="cargando" :class="variante === 'exito' ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'" class="rounded-2xl px-4 py-3 font-bold text-white shadow-lg transition disabled:opacity-60" @click="$emit('confirmar')">{{ textoConfirmar }}</button>
      </div>
    </template>
  </ModalBase>
</template>
