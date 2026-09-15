import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './compartido/infraestructura/guards/auth.guard';
import { RolesGuard } from './compartido/infraestructura/guards/roles.guard';
import { PacientesModule } from './modulos/pacientes/pacientes.module';
import { ProfesionalesModule } from './modulos/profesionales/profesionales.module';
import { EspecialidadesModule } from './modulos/especialidades/especialidades.module';
import { ReservasModule } from './modulos/reservas/reservas.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';
import { ReportesModule } from './modulos/reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USUARIO', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NOMBRE', 'clinica'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SINCRONIZAR', 'false') === 'true',
      }),
    }),
    EspecialidadesModule,
    PacientesModule,
    ProfesionalesModule,
    UsuariosModule,
    ReservasModule,
    ReportesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
