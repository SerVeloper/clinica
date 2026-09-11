import { clienteApi } from '../../../compartido/api/cliente-api'
import type { CrearUsuarioPayload, LoginPayload, LoginRespuesta, Usuario } from '../tipos/usuario'

export function login(payload: LoginPayload) {
  return clienteApi<LoginRespuesta>('/auth/login', { metodo: 'POST', cuerpo: payload })
}

export function listarUsuarios() {
  return clienteApi<Usuario[]>('/usuarios')
}

export function crearUsuario(payload: CrearUsuarioPayload) {
  return clienteApi<Usuario>('/usuarios', { metodo: 'POST', cuerpo: payload })
}
