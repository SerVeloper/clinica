export type RolUsuario = 'ADMIN' | 'ESPECIALISTA'

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  usuario: string
  rol: RolUsuario
  profesionalId: string | null
  activo: boolean
  creadoEn: string
  actualizadoEn: string
}

export interface LoginPayload {
  usuario: string
  password: string
}

export interface LoginRespuesta {
  token: string
  usuario: Usuario
}

export interface CrearUsuarioPayload {
  nombre: string
  apellido: string
  usuario: string
  password: string
  rol: RolUsuario
  profesionalId?: string | null
  activo?: boolean
}
