import { ref } from 'vue'

export type TipoToast = 'success' | 'error'

export interface Toast {
  id: number
  tipo: TipoToast
  texto: string
}

export function useToasts() {
  const toasts = ref<Toast[]>([])
  let siguienteToastId = 1

  function mostrarToast(tipo: TipoToast, texto: string) {
    const id = siguienteToastId++
    toasts.value = [...toasts.value, { id, tipo, texto }]
    window.setTimeout(() => cerrarToast(id), 4200)
  }

  function cerrarToast(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return { toasts, mostrarToast, cerrarToast }
}
