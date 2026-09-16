import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Publico } from '../../../../compartido/infraestructura/decorators/publico.decorator';
import { AuthServicio } from '../../aplicacion/servicios/auth.servicio';
import { LoginDto } from '../../aplicacion/dtos/login.dto';

const NOMBRE_COOKIE_REFRESH = 'refresh_token';
const RUTA_COOKIE = '/api/auth';

interface OpcionesCookie {
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
  path: string;
  maxAge: number;
}

interface RespuestaCookie {
  cookie(nombre: string, valor: string, opciones: OpcionesCookie): RespuestaCookie;
  clearCookie(nombre: string, opciones: OpcionesCookie): RespuestaCookie;
}

interface PeticionConCookies {
  headers: { cookie?: string };
}

@Publico()
@Controller('auth')
export class AuthControlador {
  private readonly secure: boolean;

  constructor(
    private readonly auth: AuthServicio,
    config: ConfigService,
  ) {
    this.secure = config.get<string>('COOKIE_SECURE', 'false') === 'true' || process.env.NODE_ENV === 'production';
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) respuesta: RespuestaCookie) {
    const resultado = await this.auth.login(dto);
    this.aplicarCookie(respuesta, resultado.refreshToken, resultado.expiraEn);
    return { token: resultado.token, usuario: resultado.usuario };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refrescar(@Req() peticion: PeticionConCookies, @Res({ passthrough: true }) respuesta: RespuestaCookie) {
    try {
      const refreshToken = this.leerCookie(peticion.headers.cookie);
      if (!refreshToken) throw new UnauthorizedException('Sesión requerida');

      const resultado = await this.auth.refrescar(refreshToken);
      this.aplicarCookie(respuesta, resultado.refreshToken, resultado.expiraEn);
      return { token: resultado.token, usuario: resultado.usuario };
    } catch (error) {
      respuesta.clearCookie(NOMBRE_COOKIE_REFRESH, this.opcionesCookie(0));
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cerrarSesion(@Req() peticion: PeticionConCookies, @Res({ passthrough: true }) respuesta: RespuestaCookie) {
    const refreshToken = this.leerCookie(peticion.headers.cookie);
    if (refreshToken) await this.auth.revocar(refreshToken);
    respuesta.clearCookie(NOMBRE_COOKIE_REFRESH, this.opcionesCookie(0));
  }

  private aplicarCookie(respuesta: RespuestaCookie, refreshToken: string, expiraEn: Date): void {
    const maxAge = Math.max(0, expiraEn.getTime() - Date.now());
    respuesta.cookie(NOMBRE_COOKIE_REFRESH, refreshToken, this.opcionesCookie(maxAge));
  }

  private opcionesCookie(maxAge: number): OpcionesCookie {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.secure,
      path: RUTA_COOKIE,
      maxAge,
    };
  }

  private leerCookie(encabezado?: string): string | null {
    if (!encabezado) return null;

    for (const parte of encabezado.split(';')) {
      const [nombre, ...valor] = parte.trim().split('=');
      if (nombre !== NOMBRE_COOKIE_REFRESH) continue;
      try {
        return decodeURIComponent(valor.join('='));
      } catch {
        return null;
      }
    }

    return null;
  }
}