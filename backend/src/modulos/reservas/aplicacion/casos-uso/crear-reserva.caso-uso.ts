import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { REPOSITORIO_ESPECIALIDADES, RepositorioEspecialidades } from '../../../especialidades/dominio/repositorios/repositorio-especialidades';
import { REPOSITORIO_PACIENTES, RepositorioPacientes } from '../../../pacientes/dominio/repositorios/repositorio-pacientes';
import { REPOSITORIO_PROFESIONALES, RepositorioProfesionales } from '../../../profesionales/dominio/repositorios/repositorio-profesionales';
import { UsuarioAutenticado } from '../../../usuarios/aplicacion/servicios/auth.servicio';
import { EstadoReserva } from '../../dominio/entidades/estado-reserva';
import { Reserva } from '../../dominio/entidades/reserva';
import { REPOSITORIO_RESERVAS, RepositorioReservas } from '../../dominio/repositorios/repositorio-reservas';
import { CrearReservaDto } from '../dtos/crear-reserva.dto';

const BLOQUES_HORARIOS_HABILES = [
  { inicioMinutos: 8 * 60, finMinutos: 12 * 60 },
  { inicioMinutos: 16 * 60, finMinutos: 20 * 60 },
];

@Injectable()
export class CrearReservaCasoUso {
  constructor(
    @Inject(REPOSITORIO_RESERVAS) private readonly reservas: RepositorioReservas,
    @Inject(REPOSITORIO_PACIENTES) private readonly pacientes: RepositorioPacientes,
    @Inject(REPOSITORIO_PROFESIONALES) private readonly profesionales: RepositorioProfesionales,
    @Inject(REPOSITORIO_ESPECIALIDADES) private readonly especialidades: RepositorioEspecialidades,
  ) {}

  async ejecutar(dto: CrearReservaDto, usuario: UsuarioAutenticado) {
    const [paciente, profesional, especialidad] = await Promise.all([
      this.pacientes.buscarPorId(dto.pacienteId),
      this.profesionales.buscarPorId(dto.profesionalId),
      this.especialidades.buscarPorId(dto.especialidadId),
    ]);

    if (!paciente) throw new ErrorNegocio('Paciente no encontrado');
    if (!profesional) throw new ErrorNegocio('Profesional no encontrado');
    if (!especialidad) throw new ErrorNegocio('Especialidad no encontrada');
    if (!paciente.activo) throw new ErrorNegocio('No se puede crear una reserva con un paciente inactivo');
    if (!profesional.activo) throw new ErrorNegocio('No se puede crear una reserva con un profesional inactivo');
    if (!especialidad.activo) throw new ErrorNegocio('No se puede crear una reserva con una especialidad inactiva');
    if (profesional.especialidadId !== especialidad.id) {
      throw new ErrorNegocio('La especialidad no corresponde al profesional seleccionado');
    }

    const fechaInicio = new Date(dto.fechaInicio);
    if (Number.isNaN(fechaInicio.getTime())) throw new ErrorNegocio('La fecha de inicio de la reserva no es válida');
    fechaInicio.setSeconds(0, 0);
    if (fechaInicio.getTime() <= Date.now()) throw new ErrorNegocio('No se pueden crear reservas en días u horarios pasados');
    if (!this.estaEnHorarioHabil(fechaInicio, especialidad.duracionMinutos)) {
      throw new ErrorNegocio(
        `La reserva debe iniciar en horarios hábiles: 08:00-12:00 o 16:00-20:00, cada ${especialidad.duracionMinutos} minutos para ${especialidad.nombre}`,
      );
    }

    const fechaFin = Reserva.calcularFechaFin(fechaInicio, especialidad.duracionMinutos);
    const estado = EstadoReserva.PENDIENTE;

    return this.reservas.guardar({
      pacienteId: paciente.id,
      profesionalId: profesional.id,
      especialidadId: especialidad.id,
      fechaInicio,
      fechaFin,
      estado,
      creadoPorUsuarioId: usuario.id,
      canceladoEn: null,
    });
  }

  private estaEnHorarioHabil(fecha: Date, duracionMinutos: number) {
    const minutos = fecha.getHours() * 60 + fecha.getMinutes();
    const caeEnBloque = BLOQUES_HORARIOS_HABILES.some((bloque) => minutos >= bloque.inicioMinutos && minutos < bloque.finMinutos);

    return caeEnBloque && fecha.getMinutes() % duracionMinutos === 0;
  }
}
