export interface Profesional {
  id: string
  nombre: string
  apellido: string
  telefono: string | null
  especialidadId: string
  activo: boolean
}

export interface CrearProfesionalPayload {
  nombre: string
  apellido: string
  telefono: string
  especialidadId: string
}

export type ActualizarProfesionalPayload = CrearProfesionalPayload

export interface ActualizarEstadoProfesionalPayload {
  activo: boolean
}
