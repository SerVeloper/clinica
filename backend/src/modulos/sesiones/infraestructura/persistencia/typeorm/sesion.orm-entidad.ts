import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sesiones')
export class SesionOrmEntidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Desviación aceptada del SHALL A2: usuario_id es columna uuid sin constraint FK
  // de DB, por convención del repo (igual que profesional_id en usuarios/reservas).
  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @Index()
  @Column({ name: 'token_hash', type: 'varchar', length: 64, unique: true })
  tokenHash: string;

  @Column({ name: 'expira_en', type: 'timestamptz' })
  expiraEn: Date;

  @Column({ type: 'boolean', default: false })
  revocado: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}