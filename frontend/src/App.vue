<script setup lang="ts">
import { computed, onMounted, reactive, ref, type CSSProperties } from 'vue'
import ToastStack from './componentes/ui/ToastStack.vue'
import { useToasts } from './compartido/composables/useToasts'
import type { RespuestaPaginada } from './compartido/tipos/paginacion'
import type { VistaActiva, VistaNavegacion } from './compartido/tipos/navegacion'
import AdminLayout from './layouts/AdminLayout.vue'
import ModalDetalleReserva from './modulos/agenda/componentes/ModalDetalleReserva.vue'
import ModalNuevaReserva from './modulos/agenda/componentes/ModalNuevaReserva.vue'
import { aFechaHoraLocalPayload, esHoy, esSlotPasado, obtenerInicioRangoCentrado, useAgenda, validarFechaReserva } from './modulos/agenda/composables/useAgenda'
import AgendaView from './modulos/agenda/vistas/AgendaView.vue'
import { actualizarEspecialidad, actualizarEstadoEspecialidad, crearEspecialidad, listarEspecialidades, listarEspecialidadesPaginado, type ActualizarEspecialidadPayload, type CrearEspecialidadPayload, type FiltrosEspecialidades } from './modulos/especialidades/servicios/especialidades-api'
import type { Especialidad } from './modulos/especialidades/tipos/especialidad'
import EspecialidadesView from './modulos/especialidades/vistas/EspecialidadesView.vue'
import OperacionesView from './modulos/operaciones/vistas/OperacionesView.vue'
import { actualizarEstadoPaciente, actualizarPaciente, crearPaciente, listarPacientes, listarPacientesPaginado, type FiltrosPacientes } from './modulos/pacientes/servicios/pacientes-api'
import type { Paciente } from './modulos/pacientes/tipos/paciente'
import PacientesView from './modulos/pacientes/vistas/PacientesView.vue'
import { actualizarEstadoProfesional, actualizarProfesional, crearProfesional, listarProfesionales, listarProfesionalesPaginado, type FiltrosProfesionales } from './modulos/profesionales/servicios/profesionales-api'
import type { Profesional } from './modulos/profesionales/tipos/profesional'
import ProfesionalesView from './modulos/profesionales/vistas/ProfesionalesView.vue'
import { actualizarEstadoReserva, cancelarReserva, crearReserva, listarReservas } from './modulos/reservas/servicios/reservas-api'
import type { EstadoReserva, FiltrosReservas, Reserva } from './modulos/reservas/tipos/reserva'
import LoginView from './modulos/usuarios/componentes/LoginView.vue'
import { crearUsuario, listarUsuarios, login } from './modulos/usuarios/servicios/usuarios-api'
import type { CrearUsuarioPayload, Usuario } from './modulos/usuarios/tipos/usuario'

const STORAGE_TOKEN = 'clinica_token'
const STORAGE_USUARIO = 'clinica_usuario'

const cargando = ref(false)
const navegacionColapsada = ref(false)
const modalReservaAbierto = ref(false)
const modalDetalleReservaAbierto = ref(false)
const modalPacienteAbierto = ref(false)
const modalProfesionalAbierto = ref(false)
const modalEspecialidadAbierto = ref(false)
const mostrarCrearPacienteReserva = ref(false)
const vistaActiva = ref<VistaActiva>('agenda')
const inicioRangoCalendario = ref(obtenerInicioRangoCentrado(new Date()))
const reservaSeleccionadaId = ref('')
const { toasts, mostrarToast, cerrarToast } = useToasts()
const tokenSesion = ref(localStorage.getItem(STORAGE_TOKEN) ?? '')
const usuarioActual = ref<Usuario | null>(leerUsuarioSesion())

const vistas: VistaNavegacion[] = [
  { id: 'agenda', etiqueta: 'Agenda', descripcion: 'Calendario y reservas', icono: 'calendar' },
  { id: 'pacientes', etiqueta: 'Pacientes', descripcion: 'Altas y listado', icono: 'users' },
  { id: 'profesionales', etiqueta: 'Profesionales', descripcion: 'Equipo clínico', icono: 'briefcase' },
  { id: 'especialidades', etiqueta: 'Especialidades', descripcion: 'Catálogo disponible', icono: 'clipboard' },
  { id: 'operaciones', etiqueta: 'Operaciones', descripcion: 'Estados y actividad', icono: 'activity' },
]

const estadosReserva: EstadoReserva[] = ['PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'NO_ASISTIO', 'CANCELADA']
const estadosTerminalesReserva: EstadoReserva[] = ['ATENDIDA', 'NO_ASISTIO', 'CANCELADA']

const coloresEspecialidad = [
  { fondo: '#eff6ff', borde: '#2563eb', texto: '#1e3a8a', sombra: 'rgba(37, 99, 235, 0.18)' },
  { fondo: '#f0fdf4', borde: '#16a34a', texto: '#14532d', sombra: 'rgba(22, 163, 74, 0.18)' },
  { fondo: '#fdf4ff', borde: '#c026d3', texto: '#701a75', sombra: 'rgba(192, 38, 211, 0.18)' },
  { fondo: '#fff7ed', borde: '#ea580c', texto: '#7c2d12', sombra: 'rgba(234, 88, 12, 0.18)' },
  { fondo: '#ecfeff', borde: '#0891b2', texto: '#164e63', sombra: 'rgba(8, 145, 178, 0.18)' },
  { fondo: '#fefce8', borde: '#ca8a04', texto: '#713f12', sombra: 'rgba(202, 138, 4, 0.18)' },
]

const especialidades = ref<Especialidad[]>([])
const pacientes = ref<Paciente[]>([])
const profesionales = ref<Profesional[]>([])
const reservas = ref<Reserva[]>([])
const usuarios = ref<Usuario[]>([])
const pacientesPaginados = ref<RespuestaPaginada<Paciente>>(crearPaginaVacia())
const profesionalesPaginados = ref<RespuestaPaginada<Profesional>>(crearPaginaVacia())
const especialidadesPaginadas = ref<RespuestaPaginada<Especialidad>>(crearPaginaVacia())

const formularioLogin = reactive({
  usuario: 'admin',
  password: 'admin',
})

const formularioUsuario = reactive<CrearUsuarioPayload>({
  nombre: '',
  apellido: '',
  usuario: '',
  password: '',
  rol: 'ESPECIALISTA',
  profesionalId: null,
  activo: true,
})

const formularioPaciente = reactive({
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
})

const formularioEdicionPaciente = reactive({
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
})

const formularioProfesional = reactive({
  nombre: '',
  apellido: '',
  telefono: '',
  especialidadId: '',
})

const formularioEdicionProfesional = reactive({
  nombre: '',
  apellido: '',
  telefono: '',
  especialidadId: '',
})

const formularioEspecialidad = reactive<CrearEspecialidadPayload>({
  nombre: '',
  duracionMinutos: 30,
})

const formularioEdicionEspecialidad = reactive<ActualizarEspecialidadPayload>({
  nombre: '',
  duracionMinutos: 30,
})

const especialidadEditandoId = ref('')
const pacienteEditandoId = ref('')
const profesionalEditandoId = ref('')
const pacienteEstadoPendiente = ref<Paciente | null>(null)
const profesionalEstadoPendiente = ref<Profesional | null>(null)
const especialidadEstadoPendiente = ref<Especialidad | null>(null)

const formularioReserva = reactive({
  pacienteId: '',
  profesionalId: '',
  especialidadId: '',
  fechaInicio: '',
})

const formularioPacienteReserva = reactive({
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
})

const filtrosReservas = reactive<FiltrosReservas>({
  profesionalId: '',
  pacienteId: '',
  especialidadId: '',
  estado: '',
})

const filtrosPacientes = reactive<FiltrosPacientes>({
  buscar: '',
  activo: '',
  pagina: 1,
  limite: 10,
})

const filtrosProfesionales = reactive<FiltrosProfesionales>({
  buscar: '',
  especialidadId: '',
  activo: '',
  pagina: 1,
  limite: 10,
})

const filtrosEspecialidades = reactive<FiltrosEspecialidades>({
  buscar: '',
  activo: '',
  pagina: 1,
  limite: 10,
})

const reservasOrdenadas = computed(() => {
  return [...reservas.value].sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
})

const intervaloAgendaMinutos = computed(() => {
  if (filtrosReservas.especialidadId) return duracionEspecialidad(filtrosReservas.especialidadId)

  const profesional = profesionales.value.find((item) => item.id === filtrosReservas.profesionalId)
  if (profesional) return duracionEspecialidad(profesional.especialidadId)

  return 15
})

const { diasSemana, tituloSemana, filasAgenda, cambiarSemana, irAHoy, reservasEnHorario } = useAgenda(inicioRangoCalendario, reservasOrdenadas, intervaloAgendaMinutos)

const proximasReservas = computed(() => reservasOrdenadas.value.filter((reserva) => !esEstadoTerminal(reserva.estado)).slice(0, 5))
const etiquetaFiltroEstado = computed(() => (filtrosReservas.estado ? etiquetaEstado(filtrosReservas.estado) : 'Todos los estados'))
const reservaSeleccionada = computed(() => reservas.value.find((reserva) => reserva.id === reservaSeleccionadaId.value) ?? null)
const agendaGlobal = computed(() => !filtrosReservas.profesionalId)
const profesionalIdSesion = computed(() => usuarioActual.value?.rol === 'ESPECIALISTA' ? usuarioActual.value.profesionalId : null)
const especialidadesActivas = computed(() => especialidades.value.filter((especialidad) => especialidad.activo))
const pacientesActivos = computed(() => pacientes.value.filter((paciente) => paciente.activo))
const profesionalesConEspecialidadActiva = computed(() => profesionales.value.filter((profesional) => profesional.activo && especialidadesActivas.value.some((especialidad) => especialidad.id === profesional.especialidadId)))

const profesionalesFiltradosParaReserva = computed(() => {
  if (!formularioReserva.especialidadId) return profesionalesConEspecialidadActiva.value
  return profesionalesConEspecialidadActiva.value.filter((profesional) => profesional.especialidadId === formularioReserva.especialidadId)
})

const duracionReservaSeleccionada = computed(() => {
  if (formularioReserva.especialidadId) return duracionEspecialidad(formularioReserva.especialidadId)
  return intervaloAgendaMinutos.value
})

function duracionEspecialidad(especialidadId: string) {
  return especialidades.value.find((item) => item.id === especialidadId)?.duracionMinutos ?? 15
}

function crearPaginaVacia<T>(): RespuestaPaginada<T> {
  return { datos: [], total: 0, pagina: 1, limite: 10, totalPaginas: 1 }
}

function leerUsuarioSesion(): Usuario | null {
  const guardado = localStorage.getItem(STORAGE_USUARIO)
  if (!guardado) return null

  try {
    return JSON.parse(guardado) as Usuario
  } catch {
    localStorage.removeItem(STORAGE_USUARIO)
    return null
  }
}

function aplicarFiltroInicialUsuario(usuario: Usuario) {
  filtrosReservas.profesionalId = usuario.rol === 'ESPECIALISTA' && usuario.profesionalId ? usuario.profesionalId : ''
}

function irAPendientes() {
  filtrosReservas.estado = 'PENDIENTE'
  vistaActiva.value = 'agenda'
  irAHoy()
  void refrescarReservas()
}

function nombreCompletoPaciente(id: string) {
  const paciente = pacientes.value.find((item) => item.id === id)
  return paciente ? `${paciente.apellido}, ${paciente.nombre}` : 'Paciente no encontrado'
}

function apellidoPaciente(id: string) {
  const paciente = pacientes.value.find((item) => item.id === id)
  if (!paciente) return 'Paciente'

  const apellido = paciente.apellido?.trim()
  if (apellido) return apellido

  const partesNombre = paciente.nombre.trim().split(/\s+/)
  return partesNombre.at(-1) || 'Paciente'
}

function nombreCompletoProfesional(id: string) {
  const profesional = profesionales.value.find((item) => item.id === id)
  return profesional ? `${profesional.apellido}, ${profesional.nombre}` : 'Profesional no encontrado'
}

function telefonoPaciente(id: string) {
  return pacientes.value.find((item) => item.id === id)?.telefono ?? null
}

function telefonoProfesional(id: string) {
  return profesionales.value.find((item) => item.id === id)?.telefono ?? null
}

function nombreUsuario(id: string | null) {
  if (!id) return 'Sin registrar'
  const usuario = usuarios.value.find((item) => item.id === id)
  return usuario ? `${usuario.apellido}, ${usuario.nombre} (${usuario.usuario})` : 'Usuario no encontrado'
}

function nombreEspecialidad(id: string) {
  return especialidades.value.find((item) => item.id === id)?.nombre ?? 'Especialidad no encontrada'
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

function formatearHora(fecha: string) {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

function clasesReserva(estado: EstadoReserva) {
  const clases: Record<EstadoReserva, string> = {
    PENDIENTE: 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100',
    CONFIRMADA: 'border-blue-200 bg-blue-600 text-white hover:bg-blue-700',
    ATENDIDA: 'border-emerald-200 bg-emerald-100 text-emerald-900 hover:bg-emerald-200',
    NO_ASISTIO: 'border-orange-200 bg-orange-100 text-orange-900 hover:bg-orange-200',
    CANCELADA: 'border-slate-200 bg-slate-100 text-slate-500 line-through hover:bg-slate-200',
  }

  return clases[estado]
}

function clasesBadgeEstadoReserva(estado: EstadoReserva) {
  const clases: Record<EstadoReserva, string> = {
    PENDIENTE: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
    CONFIRMADA: 'bg-blue-950 text-white ring-1 ring-blue-900',
    ATENDIDA: 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200',
    NO_ASISTIO: 'bg-orange-100 text-orange-900 ring-1 ring-orange-200',
    CANCELADA: 'bg-slate-200 text-slate-600 ring-1 ring-slate-300',
  }

  return clases[estado]
}

function estiloReservaAgenda(reserva: Reserva): CSSProperties {
  if (esEstadoTerminal(reserva.estado)) {
    return {
      backgroundColor: '#f1f5f9',
      borderColor: '#cbd5e1',
      color: '#475569',
      boxShadow: 'none',
    }
  }

  const especialidad = especialidades.value.find((item) => item.id === reserva.especialidadId)
  const indice = hashTexto(especialidad?.id || reserva.especialidadId || especialidad?.nombre || 'sin-especialidad') % coloresEspecialidad.length
  const color = coloresEspecialidad[indice]
  const confirmado = reserva.estado === 'CONFIRMADA' || reserva.estado === 'ATENDIDA'

  return {
    backgroundColor: confirmado ? color.borde : color.fondo,
    borderColor: color.borde,
    color: confirmado ? '#ffffff' : color.texto,
    boxShadow: confirmado ? `0 8px 18px ${color.sombra}` : 'none',
  }
}

function hashTexto(texto: string) {
  return Array.from(texto).reduce((acumulado, caracter) => acumulado + caracter.charCodeAt(0), 0)
}

function etiquetaEstado(estado: EstadoReserva) {
  const etiquetas: Record<EstadoReserva, string> = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    ATENDIDA: 'Atendida',
    NO_ASISTIO: 'No asistió',
    CANCELADA: 'Cancelada',
  }

  return etiquetas[estado]
}

function esEstadoTerminal(estado: EstadoReserva) {
  return estadosTerminalesReserva.includes(estado)
}

function limpiarFormularioPacienteReserva() {
  Object.assign(formularioPacienteReserva, { nombre: '', apellido: '', telefono: '', email: '' })
}

function abrirModalReserva(diaIso: string, hora: string) {
  const errorFecha = validarFechaReserva(`${diaIso}T${hora}`, intervaloAgendaMinutos.value)
  if (errorFecha) {
    mostrarToast('error', errorFecha)
    return
  }

  const profesionalFiltrado = profesionalesConEspecialidadActiva.value.find((profesional) => profesional.id === filtrosReservas.profesionalId)
  const especialidadFiltrada = especialidadesActivas.value.find((especialidad) => especialidad.id === filtrosReservas.especialidadId)

  Object.assign(formularioReserva, {
    pacienteId: '',
    profesionalId: profesionalFiltrado?.id ?? '',
    especialidadId: especialidadFiltrada?.id || profesionalFiltrado?.especialidadId || '',
    fechaInicio: `${diaIso}T${hora}`,
  })
  mostrarCrearPacienteReserva.value = pacientes.value.length === 0
  limpiarFormularioPacienteReserva()
  modalReservaAbierto.value = true
}

function abrirDetalleReserva(id: string) {
  reservaSeleccionadaId.value = id
  modalDetalleReservaAbierto.value = true
}

function cerrarDetalleReserva() {
  modalDetalleReservaAbierto.value = false
  reservaSeleccionadaId.value = ''
}

function cerrarModalReserva() {
  modalReservaAbierto.value = false
  mostrarCrearPacienteReserva.value = false
}

function cancelarAltaPacienteReserva() {
  mostrarCrearPacienteReserva.value = false
  limpiarFormularioPacienteReserva()
}

function ajustarProfesionalParaEspecialidad() {
  if (!formularioReserva.profesionalId) return

  const profesionalSeleccionado = profesionalesConEspecialidadActiva.value.find((profesional) => profesional.id === formularioReserva.profesionalId)
  if (profesionalSeleccionado?.especialidadId !== formularioReserva.especialidadId) formularioReserva.profesionalId = ''
}

async function ejecutarConEstado(accion: () => Promise<void>, mensajeExito?: string) {
  cargando.value = true

  try {
    await accion()
    if (mensajeExito) mostrarToast('success', mensajeExito)
  } catch (e) {
    if (e instanceof Error && e.message.toLowerCase().includes('sesión')) cerrarSesion()
    mostrarToast('error', e instanceof Error ? e.message : 'Ocurrió un error inesperado')
  } finally {
    cargando.value = false
  }
}

async function cargarDatosBase() {
  await ejecutarConEstado(async () => {
    const [especialidadesApi, pacientesApi, profesionalesApi, reservasApi, usuariosApi, pacientesPaginaApi, profesionalesPaginaApi, especialidadesPaginaApi] = await Promise.all([
      listarEspecialidades(),
      listarPacientes(),
      listarProfesionales(),
      listarReservas(filtrosReservas),
      listarUsuarios(),
      listarPacientesPaginado(filtrosPacientes),
      listarProfesionalesPaginado(filtrosProfesionales),
      listarEspecialidadesPaginado(filtrosEspecialidades),
    ])

    especialidades.value = especialidadesApi
    pacientes.value = pacientesApi
    profesionales.value = profesionalesApi
    reservas.value = reservasApi
    usuarios.value = usuariosApi
    pacientesPaginados.value = pacientesPaginaApi
    profesionalesPaginados.value = profesionalesPaginaApi
    especialidadesPaginadas.value = especialidadesPaginaApi
  })
}

async function refrescarPacientesPaginados(pagina = 1) {
  filtrosPacientes.pagina = pagina
  await ejecutarConEstado(async () => {
    pacientesPaginados.value = await listarPacientesPaginado(filtrosPacientes)
  })
}

async function refrescarPacientesCompletoYPaginado() {
  const [pacientesApi, pacientesPaginaApi] = await Promise.all([listarPacientes(), listarPacientesPaginado(filtrosPacientes)])
  pacientes.value = pacientesApi
  pacientesPaginados.value = pacientesPaginaApi
}

async function refrescarProfesionalesPaginados(pagina = 1) {
  filtrosProfesionales.pagina = pagina
  await ejecutarConEstado(async () => {
    profesionalesPaginados.value = await listarProfesionalesPaginado(filtrosProfesionales)
  })
}

async function refrescarProfesionalesCompletoYPaginado() {
  const [profesionalesApi, profesionalesPaginaApi] = await Promise.all([listarProfesionales(), listarProfesionalesPaginado(filtrosProfesionales)])
  profesionales.value = profesionalesApi
  profesionalesPaginados.value = profesionalesPaginaApi
}

async function refrescarEspecialidadesPaginadas(pagina = 1) {
  filtrosEspecialidades.pagina = pagina
  await ejecutarConEstado(async () => {
    especialidadesPaginadas.value = await listarEspecialidadesPaginado(filtrosEspecialidades)
  })
}

async function ingresar() {
  await ejecutarConEstado(async () => {
    const respuesta = await login({ ...formularioLogin })
    localStorage.setItem(STORAGE_TOKEN, respuesta.token)
    localStorage.setItem(STORAGE_USUARIO, JSON.stringify(respuesta.usuario))
    tokenSesion.value = respuesta.token
    usuarioActual.value = respuesta.usuario
    aplicarFiltroInicialUsuario(respuesta.usuario)
    await cargarDatosBase()
  }, 'Sesión iniciada correctamente')
}

function cerrarSesion() {
  localStorage.removeItem(STORAGE_TOKEN)
  localStorage.removeItem(STORAGE_USUARIO)
  tokenSesion.value = ''
  usuarioActual.value = null
  reservas.value = []
  usuarios.value = []
}

async function alternarAgendaGlobal() {
  if (!usuarioActual.value || usuarioActual.value.rol !== 'ESPECIALISTA') return
  filtrosReservas.profesionalId = filtrosReservas.profesionalId ? '' : (usuarioActual.value.profesionalId ?? '')
  await refrescarReservas()
}

async function refrescarReservas() {
  await ejecutarConEstado(async () => {
    reservas.value = await listarReservas(filtrosReservas)
  })
}

async function guardarPaciente() {
  await ejecutarConEstado(async () => {
    await crearPaciente({
      nombre: formularioPaciente.nombre,
      apellido: formularioPaciente.apellido,
      telefono: formularioPaciente.telefono,
      email: formularioPaciente.email || undefined,
    })
    Object.assign(formularioPaciente, { nombre: '', apellido: '', telefono: '', email: '' })
    await refrescarPacientesCompletoYPaginado()
    modalPacienteAbierto.value = false
  }, 'Paciente creado correctamente')
}

function iniciarEdicionPaciente(paciente: Paciente) {
  pacienteEditandoId.value = paciente.id
  Object.assign(formularioEdicionPaciente, {
    nombre: paciente.nombre,
    apellido: paciente.apellido,
    telefono: paciente.telefono,
    email: paciente.email ?? '',
  })
}

function cancelarEdicionPaciente() {
  pacienteEditandoId.value = ''
  Object.assign(formularioEdicionPaciente, { nombre: '', apellido: '', telefono: '', email: '' })
}

function iniciarCambioEstadoPaciente(paciente: Paciente) {
  pacienteEstadoPendiente.value = paciente
}

function cancelarCambioEstadoPaciente() {
  pacienteEstadoPendiente.value = null
}

async function confirmarCambioEstadoPaciente() {
  if (!pacienteEstadoPendiente.value) return
  await cambiarEstadoPaciente(pacienteEstadoPendiente.value)
}

async function guardarEdicionPaciente() {
  if (!pacienteEditandoId.value) return

  await ejecutarConEstado(async () => {
    await actualizarPaciente(pacienteEditandoId.value, {
      nombre: formularioEdicionPaciente.nombre,
      apellido: formularioEdicionPaciente.apellido,
      telefono: formularioEdicionPaciente.telefono,
      email: formularioEdicionPaciente.email || undefined,
    })
    cancelarEdicionPaciente()
    await refrescarPacientesCompletoYPaginado()
  }, 'Paciente actualizado correctamente')
}

async function cambiarEstadoPaciente(paciente: Paciente) {
  await ejecutarConEstado(async () => {
    await actualizarEstadoPaciente(paciente.id, { activo: !paciente.activo })
    if (pacienteEditandoId.value === paciente.id) cancelarEdicionPaciente()
    await refrescarPacientesCompletoYPaginado()
    pacienteEstadoPendiente.value = null
  }, paciente.activo ? 'Paciente desactivado correctamente' : 'Paciente activado correctamente')
}

async function guardarPacienteDesdeReserva() {
  await ejecutarConEstado(async () => {
    const pacienteCreado = await crearPaciente({
      nombre: formularioPacienteReserva.nombre,
      apellido: formularioPacienteReserva.apellido,
      telefono: formularioPacienteReserva.telefono,
      email: formularioPacienteReserva.email || undefined,
    })
    pacientes.value = await listarPacientes()
    formularioReserva.pacienteId = pacienteCreado.id
    limpiarFormularioPacienteReserva()
    mostrarCrearPacienteReserva.value = false
  }, 'Paciente creado y seleccionado para la reserva')
}

async function guardarProfesional() {
  await ejecutarConEstado(async () => {
    await crearProfesional({ ...formularioProfesional })
    Object.assign(formularioProfesional, { nombre: '', apellido: '', telefono: '', especialidadId: '' })
    await refrescarProfesionalesCompletoYPaginado()
    modalProfesionalAbierto.value = false
  }, 'Profesional creado correctamente')
}

function iniciarEdicionProfesional(profesional: Profesional) {
  profesionalEditandoId.value = profesional.id
  Object.assign(formularioEdicionProfesional, {
    nombre: profesional.nombre,
    apellido: profesional.apellido,
    telefono: profesional.telefono ?? '',
    especialidadId: profesional.especialidadId,
  })
}

function cancelarEdicionProfesional() {
  profesionalEditandoId.value = ''
  Object.assign(formularioEdicionProfesional, { nombre: '', apellido: '', telefono: '', especialidadId: '' })
}

function iniciarCambioEstadoProfesional(profesional: Profesional) {
  profesionalEstadoPendiente.value = profesional
}

function cancelarCambioEstadoProfesional() {
  profesionalEstadoPendiente.value = null
}

async function confirmarCambioEstadoProfesional() {
  if (!profesionalEstadoPendiente.value) return
  await cambiarEstadoProfesional(profesionalEstadoPendiente.value)
}

async function guardarEdicionProfesional() {
  if (!profesionalEditandoId.value) return

  await ejecutarConEstado(async () => {
    await actualizarProfesional(profesionalEditandoId.value, { ...formularioEdicionProfesional })
    cancelarEdicionProfesional()
    await refrescarProfesionalesCompletoYPaginado()
  }, 'Profesional actualizado correctamente')
}

async function cambiarEstadoProfesional(profesional: Profesional) {
  await ejecutarConEstado(async () => {
    await actualizarEstadoProfesional(profesional.id, { activo: !profesional.activo })
    if (profesionalEditandoId.value === profesional.id) cancelarEdicionProfesional()
    await refrescarProfesionalesCompletoYPaginado()
    profesionalEstadoPendiente.value = null
  }, profesional.activo ? 'Profesional desactivado correctamente' : 'Profesional activado correctamente')
}

async function guardarEspecialidad() {
  await ejecutarConEstado(async () => {
    await crearEspecialidad({ nombre: formularioEspecialidad.nombre, duracionMinutos: formularioEspecialidad.duracionMinutos })
    Object.assign(formularioEspecialidad, { nombre: '', duracionMinutos: 30 })
    especialidades.value = await listarEspecialidades()
    especialidadesPaginadas.value = await listarEspecialidadesPaginado(filtrosEspecialidades)
    modalEspecialidadAbierto.value = false
  }, 'Especialidad creada correctamente')
}

function iniciarEdicionEspecialidad(especialidad: Especialidad) {
  especialidadEditandoId.value = especialidad.id
  Object.assign(formularioEdicionEspecialidad, {
    nombre: especialidad.nombre,
    duracionMinutos: especialidad.duracionMinutos as 15 | 30 | 60,
  })
}

function cancelarEdicionEspecialidad() {
  especialidadEditandoId.value = ''
  Object.assign(formularioEdicionEspecialidad, { nombre: '', duracionMinutos: 30 })
}

function iniciarCambioEstadoEspecialidad(especialidad: Especialidad) {
  especialidadEstadoPendiente.value = especialidad
}

function cancelarCambioEstadoEspecialidad() {
  especialidadEstadoPendiente.value = null
}

async function confirmarCambioEstadoEspecialidad() {
  if (!especialidadEstadoPendiente.value) return
  await cambiarEstadoEspecialidad(especialidadEstadoPendiente.value)
}

async function guardarEdicionEspecialidad() {
  if (!especialidadEditandoId.value) return

  await ejecutarConEstado(async () => {
    await actualizarEspecialidad(especialidadEditandoId.value, {
      nombre: formularioEdicionEspecialidad.nombre,
      duracionMinutos: formularioEdicionEspecialidad.duracionMinutos,
    })
    cancelarEdicionEspecialidad()
    especialidades.value = await listarEspecialidades()
    especialidadesPaginadas.value = await listarEspecialidadesPaginado(filtrosEspecialidades)
  }, 'Especialidad actualizada correctamente')
}

async function cambiarEstadoEspecialidad(especialidad: Especialidad) {
  await ejecutarConEstado(async () => {
    await actualizarEstadoEspecialidad(especialidad.id, { activo: !especialidad.activo })
    if (especialidadEditandoId.value === especialidad.id) cancelarEdicionEspecialidad()
    especialidades.value = await listarEspecialidades()
    especialidadesPaginadas.value = await listarEspecialidadesPaginado(filtrosEspecialidades)
    especialidadEstadoPendiente.value = null
  }, especialidad.activo ? 'Especialidad desactivada correctamente' : 'Especialidad activada correctamente')
}

async function guardarUsuario() {
  await ejecutarConEstado(async () => {
    const payload: CrearUsuarioPayload = {
      ...formularioUsuario,
      profesionalId: formularioUsuario.rol === 'ESPECIALISTA' ? formularioUsuario.profesionalId : null,
    }
    await crearUsuario(payload)
    Object.assign(formularioUsuario, { nombre: '', apellido: '', usuario: '', password: '', rol: 'ESPECIALISTA', profesionalId: null, activo: true })
    usuarios.value = await listarUsuarios()
  }, 'Usuario creado correctamente')
}

async function guardarReserva() {
  const errorFecha = validarFechaReserva(formularioReserva.fechaInicio, duracionReservaSeleccionada.value)
  if (errorFecha) {
    mostrarToast('error', errorFecha)
    return
  }

  await ejecutarConEstado(async () => {
    await crearReserva({
      pacienteId: formularioReserva.pacienteId,
      profesionalId: formularioReserva.profesionalId,
      especialidadId: formularioReserva.especialidadId,
      fechaInicio: aFechaHoraLocalPayload(formularioReserva.fechaInicio),
      estado: 'PENDIENTE',
    })
    Object.assign(formularioReserva, { pacienteId: '', profesionalId: '', especialidadId: '', fechaInicio: '' })
    reservas.value = await listarReservas(filtrosReservas)
    modalReservaAbierto.value = false
  }, 'Reserva creada como pendiente')
}

async function cancelar(id: string) {
  await ejecutarConEstado(async () => {
    await cancelarReserva(id)
    reservas.value = await listarReservas(filtrosReservas)
  }, 'Reserva cancelada correctamente')
}

async function cambiarEstadoReserva(reserva: Reserva, estado: EstadoReserva) {
  if (reserva.estado === estado) return

  await ejecutarConEstado(async () => {
    await actualizarEstadoReserva(reserva.id, { estado })
    reservas.value = await listarReservas(filtrosReservas)
  }, `Reserva marcada como ${etiquetaEstado(estado).toLowerCase()}`)
}

onMounted(() => {
  if (!tokenSesion.value || !usuarioActual.value) return
  aplicarFiltroInicialUsuario(usuarioActual.value)
  void cargarDatosBase()
})
</script>

<template>
  <main class="min-h-screen bg-[var(--color-bg)] text-slate-950">
    <LoginView
      v-if="!usuarioActual"
      v-model:usuario="formularioLogin.usuario"
      v-model:password="formularioLogin.password"
      :cargando="cargando"
      @ingresar="ingresar"
    />

    <AdminLayout
      v-else
      :vistas="vistas"
      :vista-activa="vistaActiva"
      :navegacion-colapsada="navegacionColapsada"
      :cantidad-reservas="reservas.length"
      :cantidad-pacientes="pacientes.length"
      :cantidad-profesionales="profesionales.length"
      :usuario-actual="usuarioActual"
      @cambiar-vista="vistaActiva = $event"
      @alternar-colapso="navegacionColapsada = !navegacionColapsada"
      @logout="cerrarSesion"
    >
      <AgendaView
        v-if="vistaActiva === 'agenda'"
        :titulo-semana="tituloSemana"
        :dias-semana="diasSemana"
        :filas-agenda="filasAgenda"
        :intervalo-minutos="intervaloAgendaMinutos"
        :es-hoy="esHoy"
        :es-slot-pasado="esSlotPasado"
        :reservas-en-horario="reservasEnHorario"
        :estilo-reserva-agenda="estiloReservaAgenda"
        :clases-badge-estado-reserva="clasesBadgeEstadoReserva"
        :nombre-paciente-agenda="nombreCompletoPaciente"
        :nombre-especialidad="nombreEspecialidad"
        :etiqueta-estado="etiquetaEstado"
        :es-estado-terminal="esEstadoTerminal"
        :cargando="cargando"
        :puede-alternar-agenda-global="usuarioActual.rol === 'ESPECIALISTA'"
        :agenda-global="agendaGlobal"
        @cambiar-semana="cambiarSemana"
        @ir-a-hoy="irAHoy"
        @ir-a-pendientes="irAPendientes"
        @refrescar-reservas="refrescarReservas"
        @alternar-agenda-global="alternarAgendaGlobal"
        @abrir-modal-reserva="abrirModalReserva"
        @abrir-detalle-reserva="abrirDetalleReserva"
      />

      <PacientesView
        v-else-if="vistaActiva === 'pacientes'"
        :respuesta="pacientesPaginados"
        :filtros="filtrosPacientes"
        :formulario-paciente="formularioPaciente"
        :formulario-edicion-paciente="formularioEdicionPaciente"
        :paciente-editando-id="pacienteEditandoId"
        :paciente-estado-pendiente="pacienteEstadoPendiente"
        :modal-alta-abierto="modalPacienteAbierto"
        :cargando="cargando"
        @guardar-paciente="guardarPaciente"
        @abrir-alta="modalPacienteAbierto = true"
        @cerrar-alta="modalPacienteAbierto = false"
        @iniciar-edicion="iniciarEdicionPaciente"
        @cancelar-edicion="cancelarEdicionPaciente"
        @guardar-edicion="guardarEdicionPaciente"
        @cambiar-estado="iniciarCambioEstadoPaciente"
        @cancelar-cambio-estado="cancelarCambioEstadoPaciente"
        @confirmar-cambio-estado="confirmarCambioEstadoPaciente"
        @buscar="refrescarPacientesPaginados(1)"
        @cambiar-pagina="refrescarPacientesPaginados"
      />

      <ProfesionalesView
        v-else-if="vistaActiva === 'profesionales'"
        :respuesta="profesionalesPaginados"
        :filtros="filtrosProfesionales"
        :especialidades="especialidades"
        :especialidades-disponibles="especialidadesActivas"
        :formulario-profesional="formularioProfesional"
        :formulario-edicion-profesional="formularioEdicionProfesional"
        :profesional-editando-id="profesionalEditandoId"
        :profesional-estado-pendiente="profesionalEstadoPendiente"
        :modal-alta-abierto="modalProfesionalAbierto"
        :cargando="cargando"
        :nombre-especialidad="nombreEspecialidad"
        @guardar-profesional="guardarProfesional"
        @abrir-alta="modalProfesionalAbierto = true"
        @cerrar-alta="modalProfesionalAbierto = false"
        @iniciar-edicion="iniciarEdicionProfesional"
        @cancelar-edicion="cancelarEdicionProfesional"
        @guardar-edicion="guardarEdicionProfesional"
        @cambiar-estado="iniciarCambioEstadoProfesional"
        @cancelar-cambio-estado="cancelarCambioEstadoProfesional"
        @confirmar-cambio-estado="confirmarCambioEstadoProfesional"
        @buscar="refrescarProfesionalesPaginados(1)"
        @cambiar-pagina="refrescarProfesionalesPaginados"
      />

      <EspecialidadesView
        v-else-if="vistaActiva === 'especialidades'"
        :respuesta="especialidadesPaginadas"
        :filtros="filtrosEspecialidades"
        :formulario-especialidad="formularioEspecialidad"
        :formulario-edicion-especialidad="formularioEdicionEspecialidad"
        :especialidad-editando-id="especialidadEditandoId"
        :especialidad-estado-pendiente="especialidadEstadoPendiente"
        :modal-alta-abierto="modalEspecialidadAbierto"
        :cargando="cargando"
        @guardar-especialidad="guardarEspecialidad"
        @abrir-alta="modalEspecialidadAbierto = true"
        @cerrar-alta="modalEspecialidadAbierto = false"
        @iniciar-edicion="iniciarEdicionEspecialidad"
        @cancelar-edicion="cancelarEdicionEspecialidad"
        @guardar-edicion="guardarEdicionEspecialidad"
        @cambiar-estado="iniciarCambioEstadoEspecialidad"
        @cancelar-cambio-estado="cancelarCambioEstadoEspecialidad"
        @confirmar-cambio-estado="confirmarCambioEstadoEspecialidad"
        @buscar="refrescarEspecialidadesPaginadas(1)"
        @cambiar-pagina="refrescarEspecialidadesPaginadas"
      />

      <OperacionesView
        v-else
        :filtros-reservas="filtrosReservas"
        :etiqueta-filtro-estado="etiquetaFiltroEstado"
        :proximas-reservas="proximasReservas"
        :formatear-fecha="formatearFecha"
        :nombre-completo-paciente="nombreCompletoPaciente"
        :nombre-completo-profesional="nombreCompletoProfesional"
        :etiqueta-estado="etiquetaEstado"
        :usuarios="usuarios"
        :profesionales="profesionales"
        :formulario-usuario="formularioUsuario"
        :puede-crear-usuarios="usuarioActual.rol === 'ADMIN'"
        @refrescar-reservas="refrescarReservas"
        @abrir-detalle-reserva="abrirDetalleReserva"
        @guardar-usuario="guardarUsuario"
      />
    </AdminLayout>

    <ToastStack :toasts="toasts" @cerrar="cerrarToast" />

    <ModalNuevaReserva
      :abierto="modalReservaAbierto"
      :cargando="cargando"
      :mostrar-crear-paciente="mostrarCrearPacienteReserva"
      :formulario-reserva="formularioReserva"
      :formulario-paciente-reserva="formularioPacienteReserva"
      :pacientes="pacientesActivos"
      :profesionales-filtrados="profesionalesFiltradosParaReserva"
      :especialidades="especialidadesActivas"
      :profesional-fijo="false"
      :duracion-reserva-minutos="duracionReservaSeleccionada"
      @cerrar="cerrarModalReserva"
      @guardar-reserva="guardarReserva"
      @alternar-crear-paciente="mostrarCrearPacienteReserva = !mostrarCrearPacienteReserva"
      @cancelar-alta-paciente="cancelarAltaPacienteReserva"
      @guardar-paciente="guardarPacienteDesdeReserva"
      @ajustar-profesional="ajustarProfesionalParaEspecialidad"
    />

    <ModalDetalleReserva
      :abierto="modalDetalleReservaAbierto"
      :cargando="cargando"
      :reserva="reservaSeleccionada"
      :estados-reserva="estadosReserva"
      :apellido-paciente="apellidoPaciente"
      :nombre-completo-paciente="nombreCompletoPaciente"
      :nombre-completo-profesional="nombreCompletoProfesional"
      :telefono-paciente="telefonoPaciente"
      :telefono-profesional="telefonoProfesional"
      :nombre-especialidad="nombreEspecialidad"
      :formatear-fecha="formatearFecha"
      :formatear-hora="formatearHora"
      :clases-reserva="clasesReserva"
      :etiqueta-estado="etiquetaEstado"
      :es-estado-terminal="esEstadoTerminal"
      :nombre-usuario="nombreUsuario"
      @cerrar="cerrarDetalleReserva"
      @cancelar="cancelar"
      @cambiar-estado="cambiarEstadoReserva"
    />
  </main>
</template>
