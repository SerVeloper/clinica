import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const LONGITUD_LLAVE = 64;

@Injectable()
export class PasswordServicio {
  async hashear(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = (await scryptAsync(password, salt, LONGITUD_LLAVE)) as Buffer;
    return `scrypt:${salt}:${hash.toString('hex')}`;
  }

  async verificar(password: string, passwordHash: string): Promise<boolean> {
    const [algoritmo, salt, hashHex] = passwordHash.split(':');
    if (algoritmo !== 'scrypt' || !salt || !hashHex) return false;

    const hashGuardado = Buffer.from(hashHex, 'hex');
    const hashIngresado = (await scryptAsync(password, salt, hashGuardado.length)) as Buffer;

    return hashGuardado.length === hashIngresado.length && timingSafeEqual(hashGuardado, hashIngresado);
  }
}
