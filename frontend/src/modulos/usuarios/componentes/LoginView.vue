<script setup lang="ts">
import SelectorTema from '../../../compartido/componentes/SelectorTema.vue'
defineProps<{
  usuario: string
  password: string
  cargando: boolean
}>()

defineEmits<{
  'update:usuario': [valor: string]
  'update:password': [valor: string]
  ingresar: []
}>()
</script>

<template>
  <section class="grid min-h-screen place-items-center bg-pagina px-4 py-10 text-texto">
    <form class="w-full max-w-md rounded-[2rem] border border-borde bg-superficie p-7 shadow-2xl shadow-sombra/20" @submit.prevent="$emit('ingresar')">
      <div class="mb-5 flex justify-end"><SelectorTema /></div>
      <p class="text-sm font-black uppercase tracking-[0.24em] text-enlace">Clínica NIFER</p>
      <h1 class="mt-3 text-3xl font-black text-texto">Ingresar al sistema</h1>
      <p class="mt-2 text-sm text-texto-secundario">App local. Usuario inicial: <strong>admin</strong> / <strong>admin</strong>.</p>

      <div class="mt-7 space-y-4">
        <label class="block">
          <span class="text-sm font-bold text-texto-secundario">Usuario</span>
          <input :value="usuario" required class="mt-1 w-full rounded-2xl border border-control px-4 py-3 shadow-sm" autocomplete="username" @input="$emit('update:usuario', ($event.target as HTMLInputElement).value)" />
        </label>
        <label class="block">
          <span class="text-sm font-bold text-texto-secundario">Contraseña</span>
          <input :value="password" required type="password" class="mt-1 w-full rounded-2xl border border-control px-4 py-3 shadow-sm" autocomplete="current-password" @input="$emit('update:password', ($event.target as HTMLInputElement).value)" />
        </label>
      </div>

      <button :disabled="cargando" class="mt-7 w-full rounded-2xl bg-accion px-6 py-3 font-black text-sobre-accion shadow-lg shadow-sombra/25 transition hover:bg-accion-hover disabled:opacity-60">
        {{ cargando ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>
  </section>
</template>
