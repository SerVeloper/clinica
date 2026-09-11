<script setup lang="ts">
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
  <section class="grid min-h-screen place-items-center bg-blue-950 px-4 py-10 text-slate-950">
    <form class="w-full max-w-md rounded-[2rem] border border-white/20 bg-white p-7 shadow-2xl shadow-blue-950/50" @submit.prevent="$emit('ingresar')">
      <p class="text-sm font-black uppercase tracking-[0.24em] text-blue-700">Clínica NIFER</p>
      <h1 class="mt-3 text-3xl font-black text-blue-950">Ingresar al sistema</h1>
      <p class="mt-2 text-sm text-slate-500">App local. Usuario inicial: <strong>admin</strong> / <strong>admin</strong>.</p>

      <div class="mt-7 space-y-4">
        <label class="block">
          <span class="text-sm font-bold text-slate-700">Usuario</span>
          <input :value="usuario" required class="mt-1 w-full rounded-2xl border border-blue-100 px-4 py-3 shadow-sm" autocomplete="username" @input="$emit('update:usuario', ($event.target as HTMLInputElement).value)" />
        </label>
        <label class="block">
          <span class="text-sm font-bold text-slate-700">Contraseña</span>
          <input :value="password" required type="password" class="mt-1 w-full rounded-2xl border border-blue-100 px-4 py-3 shadow-sm" autocomplete="current-password" @input="$emit('update:password', ($event.target as HTMLInputElement).value)" />
        </label>
      </div>

      <button :disabled="cargando" class="mt-7 w-full rounded-2xl bg-blue-700 px-6 py-3 font-black text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 disabled:opacity-60">
        {{ cargando ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>
  </section>
</template>
