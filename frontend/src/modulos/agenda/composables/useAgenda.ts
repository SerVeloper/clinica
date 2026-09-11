import { computed, type Ref } from 'vue'
import type { Reserva } from '../../reservas/tipos/reserva'

export type TurnoAgendaId = 'manana' | 'tarde'

export type FilaAgenda =
  | { tipo: 'turno'; id: TurnoAgendaId; etiqueta: string; detalle: string; inicioMinutos: number; finMinutos: number }
  | { tipo: 'horario'; hora: string; turnoId: TurnoAgendaId }
  | { tipo: 'pausa'; id: string; etiqueta: string; detalle: string; inicioMinutos: number; finMinutos: number }

export type ReferenciaFilaAgenda = `turno:${TurnoAgendaId}` | `horario:${string}` | `pausa:${string}`

const bloquesHorarios = [
  { id: 'manana' as const, etiqueta: 'Mañana', detalle: '08:00-12:00', inicioMinutos: 8 * 60, finMinutos: 12 * 60 },
  { id: 'tarde' as const, etiqueta: 'Tarde', detalle: '16:00-20:00', inicioMinutos: 16 * 60, finMinutos: 20 * 60 },
]

const INTERVALO_GRILLA_MINUTOS = 30
const pausaMediodia = { id: 'pausa-mediodia', inicioMinutos: 12 * 60, finMinutos: 16 * 60 }

export function useAgenda(inicioRangoCalendario: Ref<Date>, reservasOrdenadas: Ref<Reserva[]>, _intervaloMinutos: Ref<number>) {
  const diasSemana = computed(() => {
    return Array.from({ length: 7 }, (_, indice) => {
      const fecha = sumarDias(inicioRangoCalendario.value, indice)

      return {
        fecha,
        iso: aFechaInput(fecha),
        dia: new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(fecha),
        numero: new Intl.DateTimeFormat('es-AR', { day: '2-digit' }).format(fecha),
      }
    })
  })

  const tituloSemana = computed(() => {
    const inicio = diasSemana.value[0]?.fecha ?? inicioRangoCalendario.value
    const fin = diasSemana.value[6]?.fecha ?? sumarDias(inicioRangoCalendario.value, 6)
    const mes = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(inicio)

    return `${inicio.getDate()} al ${fin.getDate()} de ${mes}`
  })

  const filasAgenda = computed<FilaAgenda[]>(() => [
    { tipo: 'turno', ...bloquesHorarios[0] },
    ...crearHorariosBloque(bloquesHorarios[0].inicioMinutos, bloquesHorarios[0].finMinutos, INTERVALO_GRILLA_MINUTOS).map((hora) => ({ tipo: 'horario' as const, hora, turnoId: bloquesHorarios[0].id })),
    { tipo: 'pausa', etiqueta: 'Cerrado', detalle: 'Pausa clínica 12:00-16:00', ...pausaMediodia },
    { tipo: 'turno', ...bloquesHorarios[1] },
    ...crearHorariosBloque(bloquesHorarios[1].inicioMinutos, bloquesHorarios[1].finMinutos, INTERVALO_GRILLA_MINUTOS).map((hora) => ({ tipo: 'horario' as const, hora, turnoId: bloquesHorarios[1].id })),
  ])

  const reservasPorHorario = computed(() => {
    const mapa = new Map<string, Reserva[]>()

    for (const reserva of reservasOrdenadas.value) {
      const fecha = new Date(reserva.fechaInicio)
      const clave = `${aFechaInput(fecha)}T${aHoraVisible(fecha)}`
      const reservasDelHorario = mapa.get(clave) ?? []
      reservasDelHorario.push(reserva)
      mapa.set(clave, reservasDelHorario)
    }

    return mapa
  })

  function cambiarSemana(dias: number) {
    inicioRangoCalendario.value = sumarDias(inicioRangoCalendario.value, dias)
  }

  function irAHoy() {
    inicioRangoCalendario.value = obtenerInicioRangoCentrado(new Date())
  }

  function reservasEnHorario(diaIso: string, hora: string) {
    return reservasPorHorario.value.get(`${diaIso}T${hora}`) ?? []
  }

  return { diasSemana, tituloSemana, filasAgenda, cambiarSemana, irAHoy, reservasEnHorario }
}

export function obtenerInicioRangoCentrado(fecha: Date) {
  const copia = new Date(fecha)
  copia.setDate(copia.getDate() - 3)
  copia.setHours(0, 0, 0, 0)

  return copia
}

export function sumarDias(fecha: Date, dias: number) {
  const copia = new Date(fecha)
  copia.setDate(copia.getDate() + dias)

  return copia
}

export function aFechaInput(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

export function aHoraInput(fecha: Date) {
  return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`
}

export function aFechaHoraLocalInput(fecha: Date) {
  return `${aFechaInput(fecha)}T${aHoraInput(fecha)}`
}

export function aFechaHoraLocalPayload(fechaTexto: string) {
  const fecha = new Date(fechaTexto)
  fecha.setSeconds(0, 0)

  return `${aFechaHoraLocalInput(fecha)}:00.000`
}

export function claveFilaAgenda(fila: FilaAgenda): ReferenciaFilaAgenda {
  if (fila.tipo === 'turno') return `turno:${fila.id}`
  return fila.tipo === 'horario' ? `horario:${fila.hora}` : `pausa:${fila.id}`
}

export function turnoReferenciaActual(fecha = new Date()): TurnoAgendaId {
  const minutos = fecha.getHours() * 60 + fecha.getMinutes()

  if (minutos < bloquesHorarios[0].finMinutos) return 'manana'
  return 'tarde'
}

export function horaReferenciaActual(fecha = new Date(), _intervaloMinutos = 30): ReferenciaFilaAgenda {
  const minutos = fecha.getHours() * 60 + fecha.getMinutes()
  const horariosDisponibles = bloquesHorarios.flatMap((bloque) => crearHorariosBloque(bloque.inicioMinutos, bloque.finMinutos, INTERVALO_GRILLA_MINUTOS))

  if (minutos >= pausaMediodia.inicioMinutos && minutos < pausaMediodia.finMinutos) return `pausa:${pausaMediodia.id}`
  if (minutos < bloquesHorarios[0].inicioMinutos) return `horario:${horariosDisponibles[0] ?? '08:00'}`
  if (minutos >= bloquesHorarios.at(-1)!.finMinutos) return `horario:${horariosDisponibles.at(-1) ?? '19:30'}`

  const minutosReferencia = bloquesHorarios.some((bloque) => minutos >= bloque.inicioMinutos && minutos < bloque.finMinutos)
    ? Math.floor(minutos / INTERVALO_GRILLA_MINUTOS) * INTERVALO_GRILLA_MINUTOS
    : bloquesHorarios[1].inicioMinutos

  const horarioReferencia = horariosDisponibles.reduce((horarioMasCercano, horario) => {
    const distanciaActual = Math.abs(aMinutos(horario) - minutosReferencia)
    const distanciaMasCercana = Math.abs(aMinutos(horarioMasCercano) - minutosReferencia)

    return distanciaActual < distanciaMasCercana ? horario : horarioMasCercano
  }, horariosDisponibles[0] ?? '08:00')

  return `horario:${horarioReferencia}`
}

export function subslotsHorario(hora: string, intervaloMinutos: number) {
  const minutosFila = aMinutos(hora)
  const bloque = bloquesHorarios.find((item) => minutosFila >= item.inicioMinutos && minutosFila < item.finMinutos)
  if (!bloque) return []

  const desplazamientoBloque = minutosFila - bloque.inicioMinutos
  if (intervaloMinutos === 60 && desplazamientoBloque % intervaloMinutos !== 0) return []

  const cantidadSubslots = Math.max(1, INTERVALO_GRILLA_MINUTOS / intervaloMinutos)

  return Array.from({ length: cantidadSubslots }, (_, indice) => aHoraDesdeMinutos(minutosFila + indice * intervaloMinutos))
    .filter((horaSubslot) => aMinutos(horaSubslot) < bloque.finMinutos)
}

export function horaReserva(reserva: Reserva) {
  return aHoraInput(new Date(reserva.fechaInicio))
}

function crearHorariosBloque(inicioMinutos: number, finMinutos: number, intervaloMinutos: number) {
  return Array.from({ length: (finMinutos - inicioMinutos) / intervaloMinutos }, (_, indice) => {
    const minutosDesdeMedianoche = inicioMinutos + indice * intervaloMinutos
    const horas = Math.floor(minutosDesdeMedianoche / 60)
    const minutos = minutosDesdeMedianoche % 60

    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
  })
}

function aHoraDesdeMinutos(minutosDesdeMedianoche: number) {
  const horas = Math.floor(minutosDesdeMedianoche / 60)
  const minutos = minutosDesdeMedianoche % 60

  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
}

function aHoraVisible(fecha: Date) {
  const minutosVisibles = Math.floor((fecha.getHours() * 60 + fecha.getMinutes()) / INTERVALO_GRILLA_MINUTOS) * INTERVALO_GRILLA_MINUTOS

  return aHoraDesdeMinutos(minutosVisibles)
}

function aMinutos(hora: string) {
  const [horas = '0', minutos = '0'] = hora.split(':')

  return Number(horas) * 60 + Number(minutos)
}

export function fechaSlot(diaIso: string, hora: string) {
  return new Date(`${diaIso}T${hora}`)
}

export function esSlotPasado(diaIso: string, hora: string) {
  return fechaSlot(diaIso, hora).getTime() <= Date.now()
}

export function estaEnHorarioHabil(fecha: Date, duracionMinutos = 30) {
  const minutos = fecha.getHours() * 60 + fecha.getMinutes()
  const caeEnBloque = bloquesHorarios.some((bloque) => minutos >= bloque.inicioMinutos && minutos < bloque.finMinutos)

  return caeEnBloque && fecha.getMinutes() % duracionMinutos === 0
}

export function validarFechaReserva(fechaTexto: string, duracionMinutos = 30) {
  if (!fechaTexto) return 'Seleccioná fecha y hora para la reserva.'

  const fecha = new Date(fechaTexto)
  if (Number.isNaN(fecha.getTime())) return 'La fecha y hora seleccionada no es válida.'
  if (fecha.getTime() <= Date.now()) return 'No se pueden crear reservas en días u horarios pasados.'
  if (!estaEnHorarioHabil(fecha, duracionMinutos)) return `La reserva debe iniciar en horarios hábiles: 08:00-12:00 o 16:00-20:00, cada ${duracionMinutos} minutos.`

  return null
}

export function esHoy(diaIso: string) {
  return diaIso === aFechaInput(new Date())
}
