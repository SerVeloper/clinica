// Respaldo de sesión en memoria para navegadores que bloquean almacenamiento.
const memoria = new Map<string, string | null>()

export function leerSesion(clave: string): string | null {
  if (memoria.has(clave)) return memoria.get(clave) ?? null
  try { return localStorage.getItem(clave) } catch { return null }
}

export function guardarSesion(clave: string, valor: string | null) {
  memoria.set(clave, valor)
  try {
    if (valor === null) localStorage.removeItem(clave)
    else localStorage.setItem(clave, valor)
    memoria.delete(clave)
  } catch {
    // App y cliente API comparten el mismo respaldo hasta recargar la página.
  }
}
