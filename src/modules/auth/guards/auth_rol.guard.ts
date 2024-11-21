import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthRolGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector, // obtengo metadata del decorador
    ){}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

         // Si no hay usuario en la solicitud, lanzo una excepción indicando que el usuario no está autenticado
        if (!user) {
            throw new ForbiddenException('Usuario no autenticado');
        }

        // Obtengo los roles requeridos desde la metadata de la ruta
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles || requiredRoles.length === 0) {
            return true; 
        }

        // Verifico si el usuario tiene rol requerido
        const userRoles = user.role || []; //Roles del usuario
        const hasRole = requiredRoles.some(role => userRoles.includes(role));

        // Si el usuario no tiene uno de los roles requeridos, lanzo una excepción que no tiene acceso
        if (!hasRole) {
            throw new ForbiddenException('No puedes acceder a esta ruta');
        }

        return true;
    }
}