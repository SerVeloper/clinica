import { leerSesion } from './almacenamiento-sesion'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

type MetodoHttp = 'GET' | 'POST' | 'PATCH'

interface OpcionesPeticion {
  metodo?: MetodoHttp
  cuerpo?: unknown
  parametros?: Record<string, string | number | boolean | undefined>
}

export async function clienteApi<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const url = new URL(`${API_URL}${ruta}`)

  Object.entries(opciones.parametros ?? {}).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== '') url.searchParams.set(clave, String(valor))
  })

  const token = leerSesion('clinica_token')
  const headers = new Headers()
  if (opciones.cuerpo) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const respuesta = await fetch(url, {
    method: opciones.metodo ?? 'GET',
    headers,
    body: opciones.cuerpo ? JSON.stringify(opciones.cuerpo) : undefined,
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => null)
    const mensaje = detalle?.message ?? 'Ocurrió un error al comunicarse con la API'
    throw new Error(Array.isArray(mensaje) ? mensaje.join(', ') : mensaje)
  }

  return respuesta.json() as Promise<T>
}
