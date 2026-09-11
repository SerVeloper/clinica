export const ROLES_USUARIO = ['ADMIN', 'ESPECIALISTA'] as const;

export type RolUsuario = (typeof ROLES_USUARIO)[number];

export function esRolUsuario(valor: string): valor is RolUsuario {
  return ROLES_USUARIO.includes(valor as RolUsuario);
}
