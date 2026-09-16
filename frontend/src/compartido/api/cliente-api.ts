import { guardarSesion, leerSesion } from './almacenamiento-sesion'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const CLAVE_TOKEN = 'clinica_token'
const CLAVE_USUARIO = 'clinica_usuario'
const EVENTO_SESION_EXPIRADA = 'clinica:sesion-expirada'

type MetodoHttp = 'GET' | 'POST' | 'PATCH'

interface OpcionesPeticion {
  metodo?: MetodoHttp
  cuerpo?: unknown
  parametros?: Record<string, string | number | boolean | undefined>
}

let refrescoEnCurso: Promise<boolean> | null = null

function limpiarSesionLocal() {
  guardarSesion(CLAVE_TOKEN, null)
  guardarSesion(CLAVE_USUARIO, null)
  window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
}

function refrescarSesion(): Promise<boolean> {
  if (refrescoEnCurso) return refrescoEnCurso

  refrescoEnCurso = (async () => {
    try {
      const respuesta = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      if (respuesta.status === 204 || !respuesta.ok) {
        limpiarSesionLocal()
        return false
      }

      const datos = await respuesta.json().catch(() => null)
      if (!datos?.token) {
        limpiarSesionLocal()
        return false
      }

      guardarSesion(CLAVE_TOKEN, datos.token)
      return true
    } catch {
      limpiarSesionLocal()
      return false
    } finally {
      refrescoEnCurso = null
    }
  })()

  return refrescoEnCurso
}

function construirUrl(ruta: string, parametros?: Record<string, string | number | boolean | undefined>): URL {
  const url = new URL(`${API_URL}${ruta}`)

  Object.entries(parametros ?? {}).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== '') url.searchParams.set(clave, String(valor))
  })

  return url
}

function construirHeaders(conCuerpo: boolean): Headers {
  const headers = new Headers()
  if (conCuerpo) headers.set('Content-Type', 'application/json')
  const token = leerSesion(CLAVE_TOKEN)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return headers
}

async function ejecutarPeticion(ruta: string, opciones: OpcionesPeticion): Promise<Response> {
  const url = construirUrl(ruta, opciones.parametros)

  const ejecutar = (): Promise<Response> => {
    return fetch(url, {
      method: opciones.metodo ?? 'GET',
      headers: construirHeaders(Boolean(opciones.cuerpo)),
      body: opciones.cuerpo ? JSON.stringify(opciones.cuerpo) : undefined,
      credentials: 'include',
    })
  }

  const tokenAlMomento = leerSesion(CLAVE_TOKEN)
  let respuesta = await ejecutar()

  if (respuesta.status === 401 && tokenAlMomento) {
    const tokenActual = leerSesion(CLAVE_TOKEN)
    if (tokenActual === tokenAlMomento) {
      const refrescada = await refrescarSesion()
      if (refrescada) respuesta = await ejecutar()
    } else if (tokenActual) {
      respuesta = await ejecutar()
    }
  }

  return respuesta
}

export async function clienteApi<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const respuesta = await ejecutarPeticion(ruta, opciones)

  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => null)
    const mensaje = detalle?.message ?? 'Ocurrió un error al comunicarse con la API'
    throw new Error(Array.isArray(mensaje) ? mensaje.join(', ') : mensaje)
  }

  if (respuesta.status === 204) return undefined as T
  return respuesta.json() as Promise<T>
}

export function cerrarSesionEnServidor(): Promise<void> {
  return clienteApi<void>('/auth/logout', { metodo: 'POST' })
}

export async function descargarBlob(
  ruta: string,
  parametros: Record<string, string | number | boolean | undefined>,
): Promise<Blob> {
  const respuesta = await ejecutarPeticion(ruta, { parametros })

  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => null)
    const mensaje = detalle?.message ?? 'Ocurrió un error al descargar el reporte'
    throw new Error(Array.isArray(mensaje) ? mensaje.join(', ') : mensaje)
  }

  return respuesta.blob()
}