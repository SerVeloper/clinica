import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { EstadoReserva } from '../../../dominio/entidades/estado-reserva';

@Entity('reservas')
export class ReservaOrmEntidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'paciente_id', type: 'uuid' })
  pacienteId: string;

  @Column({ name: 'profesional_id', type: 'uuid' })
  profesionalId: string;

  @Column({ name: 'especialidad_id', type: 'uuid' })
  especialidadId: string;

  @Column({ name: 'fecha_inicio', type: 'timestamptz' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamptz' })
  fechaFin: Date;

  @Column({ type: 'enum', enum: EstadoReserva })
  estado: EstadoReserva;

  @Column({ name: 'creado_por_usuario_id', type: 'uuid', nullable: true })
  creadoPorUsuarioId: string | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @Column({ name: 'cancelado_en', type: 'timestamptz', nullable: true })
  canceladoEn: Date | null;
}
