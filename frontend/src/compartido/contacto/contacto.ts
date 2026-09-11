function normalizarTelefono(telefono: string | null | undefined) {
  const limpio = (telefono ?? '').trim().replace(/[\s()-]/g, '').replace(/[^\d+]/g, '')
  const sinPlusDuplicados = limpio.startsWith('+') ? `+${limpio.slice(1).replace(/\+/g, '')}` : limpio.replace(/\+/g, '')

  return /\d/.test(sinPlusDuplicados) ? sinPlusDuplicados : ''
}

export function enlaceTelefono(telefono: string | null | undefined) {
  const normalizado = normalizarTelefono(telefono)
  return normalizado ? `tel:${normalizado}` : null
}

export function enlaceWhatsapp(telefono: string | null | undefined) {
  const digitos = normalizarTelefono(telefono).replace(/\D/g, '')
  return digitos ? `https://wa.me/${digitos}` : null
}
