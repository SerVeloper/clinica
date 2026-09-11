import { readonly, ref } from 'vue'

export type PreferenciaTema = 'claro' | 'oscuro' | 'sistema'
export type Tema = Exclude<PreferenciaTema, 'sistema'>

const CLAVE_TEMA = 'clinica_tema'
const preferencia = ref<PreferenciaTema>('sistema')
const temaResuelto = ref<Tema>('claro')
let consulta: MediaQueryList | undefined
let limpiar: (() => void) | undefined

export function validarPreferencia(valor: unknown): PreferenciaTema {
  return valor === 'claro' || valor === 'oscuro' ? valor : 'sistema'
}

export function resolverTema(valor: PreferenciaTema, sistemaOscuro: boolean): Tema {
  return valor === 'sistema' ? (sistemaOscuro ? 'oscuro' : 'claro') : valor
}

function aplicarTema() {
  temaResuelto.value = resolverTema(preferencia.value, consulta?.matches ?? false)
  document.documentElement.dataset.tema = temaResuelto.value
  document.documentElement.style.colorScheme = temaResuelto.value === 'oscuro' ? 'dark' : 'light'
}

function leerPreferencia() {
  try {
    return validarPreferencia(window.localStorage.getItem(CLAVE_TEMA))
  } catch {
    return 'sistema' as const
  }
}

/** Una única suscripción por aplicación; los selectores sólo consumen el estado. */
export function iniciarTema() {
  if (limpiar) return limpiar
  try {
    consulta = window.matchMedia('(prefers-color-scheme: dark)')
  } catch {
    consulta = undefined
  }
  preferencia.value = leerPreferencia()
  aplicarTema()
  const actualizarSistema = () => {
    if (preferencia.value === 'sistema') aplicarTema()
  }
  consulta?.addEventListener('change', actualizarSistema)
  const consultaActual = consulta
  const detener = () => {
    // Una limpieza antigua no debe cancelar una inicialización posterior.
    if (limpiar !== detener) return
    consultaActual?.removeEventListener('change', actualizarSistema)
    consulta = undefined
    limpiar = undefined
  }
  limpiar = detener
  return detener
}

function cambiarTema(valor: PreferenciaTema) {
  preferencia.value = validarPreferencia(valor)
  aplicarTema()
  try {
    if (preferencia.value === 'sistema') window.localStorage.removeItem(CLAVE_TEMA)
    else window.localStorage.setItem(CLAVE_TEMA, preferencia.value)
  } catch {
    // La preferencia sigue funcionando en memoria si el navegador bloquea storage.
  }
}

export function useTema() {
  return { preferencia: readonly(preferencia), temaResuelto: readonly(temaResuelto), cambiarTema }
}

if (import.meta.hot) import.meta.hot.dispose(() => limpiar?.())
