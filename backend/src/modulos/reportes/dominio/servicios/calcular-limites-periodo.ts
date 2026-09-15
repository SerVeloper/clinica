import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import type { ModoPeriodoReporte } from '../modelos/reporte-reservas';

export interface ValoresLimitesPeriodo {
  fecha?: string;
  mes?: string;
  desde?: string;
  hasta?: string;
}

export interface LimitesPeriodoReporte {
  desde: Date;
  hasta: Date;
}

const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const PATRON_MES = /^\d{4}-\d{2}$/;

function fechaUtcValida(iso: string): boolean {
  const [anio, mes, dia] = iso.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
}

function parsearMes(mes: string): { anio: number; mesNumero: number } {
  const [anio, mesNumero] = mes.split('-').map(Number);
  if (mesNumero < 1 || mesNumero > 12) {
    throw new ErrorNegocio('Mes fuera de rango');
  }
  return { anio, mesNumero };
}

/** Inicio del día de hoy expresado en UTC (misma convención que el resto del módulo). */
function hoyInicioUtc(): number {
  const ahora = new Date();
  return Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate());
}

function validarInicioNoFuturo(desde: Date, mensaje: string): void {
  if (desde.getTime() > hoyInicioUtc()) {
    throw new ErrorNegocio(mensaje);
  }
}

export function calcularLimitesPeriodo(
  modo: ModoPeriodoReporte | undefined,
  valores: ValoresLimitesPeriodo,
): LimitesPeriodoReporte {
  if (!modo) throw new ErrorNegocio('Debe indicar un modo de período: FECHA, MES o RANGO');

  if (modo === 'FECHA') {
    if (valores.desde || valores.hasta || valores.mes) {
      throw new ErrorNegocio('El modo FECHA no admite meses ni rangos');
    }
    const { fecha } = valores;
    if (!fecha || !PATRON_FECHA.test(fecha) || !fechaUtcValida(fecha)) {
      throw new ErrorNegocio('Fecha inválida');
    }
    const desde = new Date(`${fecha}T00:00:00.000Z`);
    const hasta = new Date(desde.getTime() + 24 * 60 * 60 * 1000);
    validarInicioNoFuturo(desde, 'No se puede consultar una fecha posterior a hoy');
    return { desde, hasta };
  }

  if (modo === 'MES') {
    if (valores.fecha || valores.desde || valores.hasta) {
      throw new ErrorNegocio('El modo MES no admite fechas de día ni rangos');
    }
    const { mes } = valores;
    if (!mes || !PATRON_MES.test(mes)) throw new ErrorNegocio('Mes inválido');
    const { anio, mesNumero } = parsearMes(mes);
    const desde = new Date(Date.UTC(anio, mesNumero - 1, 1));
    const hasta =
      mesNumero === 12
        ? new Date(Date.UTC(anio + 1, 0, 1))
        : new Date(Date.UTC(anio, mesNumero, 1));
    validarInicioNoFuturo(desde, 'No se puede consultar un mes posterior al actual');
    return { desde, hasta };
  }

  if (valores.fecha || valores.mes) {
    throw new ErrorNegocio('El modo RANGO no admite un día o mes suelto');
  }

  const { desde, hasta } = valores;
  if (
    !desde ||
    !hasta ||
    !PATRON_FECHA.test(desde) ||
    !PATRON_FECHA.test(hasta) ||
    !fechaUtcValida(desde) ||
    !fechaUtcValida(hasta)
  ) {
    throw new ErrorNegocio('Rango inválido: indique fechas de inicio y fin válidas');
  }

  const desdeFecha = new Date(`${desde}T00:00:00.000Z`);
  const hastaFecha = new Date(`${hasta}T00:00:00.000Z`);

  if (desdeFecha.getTime() > hastaFecha.getTime()) {
    throw new ErrorNegocio('El inicio del rango no puede ser posterior al fin');
  }

  validarInicioNoFuturo(desdeFecha, 'No se puede consultar un rango con inicio posterior a hoy');
  validarInicioNoFuturo(hastaFecha, 'No se puede consultar un rango con fin posterior a hoy');

  return { desde: desdeFecha, hasta: new Date(hastaFecha.getTime() + 24 * 60 * 60 * 1000) };
}