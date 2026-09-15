import type { ResumenReporteReservas } from '../modelos/reporte-reservas';

export function etiquetaEstadoReserva(estado: string): string {
  const etiquetas: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    ATENDIDA: 'Atendida',
    NO_ASISTIO: 'No asistió',
    CANCELADA: 'Cancelada',
  };
  return etiquetas[estado] ?? estado;
}

export function descripcionFiltrosAplicados(resumen: ResumenReporteReservas): string {
  const { filtrosAplicados } = resumen;
  const partes: string[] = [];
  if (filtrosAplicados.estado) partes.push(`Estado: ${etiquetaEstadoReserva(filtrosAplicados.estado)}`);
  if (filtrosAplicados.profesionalId) partes.push(`Profesional: ${filtrosAplicados.profesionalId}`);
  if (filtrosAplicados.especialidadId) partes.push(`Especialidad: ${filtrosAplicados.especialidadId}`);
  return partes.length > 0 ? partes.join(' · ') : 'Ninguno';
}