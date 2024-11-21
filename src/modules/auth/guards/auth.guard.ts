import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {Request} from 'express'


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService
  ){}

  // Decido si puede acceder a la ruta o no 
  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    if(!token){
      throw new UnauthorizedException()
    }

    try {
      // Verifico el token con mi palabra secreta
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      request.user = payload; //Si es valido, asigno el payload al objeto de la solicitud
    } catch (error) {
      throw new UnauthorizedException();
    }

    //Si es correcto permito el acceso a la ruta
    return true;
  }

  // Extraigo el token del header de la solicitud 
  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
