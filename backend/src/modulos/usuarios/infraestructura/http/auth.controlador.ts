import { Body, Controller, Post } from '@nestjs/common';
import { Publico } from '../../../../compartido/infraestructura/decorators/publico.decorator';
import { AuthServicio } from '../../aplicacion/servicios/auth.servicio';
import { LoginDto } from '../../aplicacion/dtos/login.dto';

@Publico()
@Controller('auth')
export class AuthControlador {
  constructor(private readonly auth: AuthServicio) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
