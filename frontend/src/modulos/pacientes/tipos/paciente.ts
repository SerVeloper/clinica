export interface Paciente {
  id: string
  nombre: string
  apellido: string
  telefono: string
  email: string | null
  activo: boolean
}

export interface CrearPacientePayload {
  nombre: string
  apellido: string
  telefono: string
  email?: string
}

export type ActualizarPacientePayload = CrearPacientePayload

export interface ActualizarEstadoPacientePayload {
  activo: boolean
}
