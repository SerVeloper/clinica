import { computed, reactive, ref } from 'vue'
import type { TipoToast } from '../../../compartido/composables/useToasts'
import { consultarResumen, descargarReporte } from '../servicios/reportes-api'
import type { FiltrosReporteReservas, FormatoReporteReservas, ResumenReporteReservas } from '../tipos/reporte-reservas'

function hoyIsoUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

function mesActualIso(): string {
  return new Date().toISOString().slice(0, 7)
}

function filtrosIniciales(): FiltrosReporteReservas {
  const hoy = hoyIsoUtc()
  return {
    modo: 'FECHA',
    fecha: hoy,
    mes: mesActualIso(),
    desde: hoy,
    hasta: hoy,
    estado: '',
    profesionalId: '',
    especialidadId: '',
  }
}

function copiarFiltros(filtros: FiltrosReporteReservas): FiltrosReporteReservas {
  return { ...filtros }
}

function sonFiltrosIguales(a: FiltrosReporteReservas, b: FiltrosReporteReservas): boolean {
  return a.modo === b.modo && a.fecha === b.fecha && a.mes === b.mes && a.desde === b.desde && a.hasta === b.hasta && a.estado === b.estado && a.profesionalId === b.profesionalId && a.especialidadId === b.especialidadId
}

export function useReportesReservas(mostrarToast: (tipo: TipoToast, texto: string) => void) {
  const borrador = reactive<FiltrosReporteReservas>(filtrosIniciales())
  const aplicados = ref<FiltrosReporteReservas | null>(null)
  const resumen = ref<ResumenReporteReservas | null>(null)
  const consultando = ref(false)
  const exportando = ref<FormatoReporteReservas | null>(null)
  const errorConsulta = ref('')

  const desactualizado = computed(() => {
    if (!aplicados.value || !resumen.value) return false
    return !sonFiltrosIguales(aplicados.value, borrador)
  })

  function validarBorrador(): string {
    if (borrador.modo === 'FECHA' && !borrador.fecha) return 'Seleccioná el día a reportar'
    if (borrador.modo === 'MES' && !borrador.mes) return 'Seleccioná el mes a reportar'
    if (borrador.modo === 'RANGO') {
      if (!borrador.desde || !borrador.hasta) return 'Seleccioná el inicio y el fin del rango'
      if (borrador.desde > borrador.hasta) return 'La fecha de inicio no puede ser posterior a la de fin'
    }
    return ''
  }

  async function consultar(): Promise<void> {
    const mensajeError = validarBorrador()
    if (mensajeError) {
      mostrarToast('error', mensajeError)
      return
    }

    consultando.value = true
    errorConsulta.value = ''
    try {
      const filtrosParaConsultar = copiarFiltros(borrador)
      resumen.value = await consultarResumen(filtrosParaConsultar)
      aplicados.value = filtrosParaConsultar
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : 'Ocurrió un error al consultar el reporte'
      errorConsulta.value = mensaje
      mostrarToast('error', mensaje)
    } finally {
      consultando.value = false
    }
  }

  async function exportar(formato: FormatoReporteReservas): Promise<void> {
    if (!aplicados.value || !resumen.value) return
    if (desactualizado.value) {
      mostrarToast('error', 'Los filtros cambiaron; consultá el reporte antes de exportar')
      return
    }

    exportando.value = formato
    const periodo = resumen.value.periodo
    try {
      const blob = await descargarReporte(aplicados.value, formato)
      guardarArchivoLocal(blob, `reporte-reservas-${periodo.desde}-${periodo.hasta}.${formato === 'excel' ? 'xlsx' : 'pdf'}`)
      mostrarToast('success', 'Reporte descargado correctamente')
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : 'Ocurrió un error al exportar el reporte'
      mostrarToast('error', mensaje)
    } finally {
      exportando.value = null
    }
  }

  return {
    borrador,
    aplicados,
    resumen,
    consultando,
    exportando,
    errorConsulta,
    desactualizado,
    consultar,
    exportar,
  }
}

function guardarArchivoLocal(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}