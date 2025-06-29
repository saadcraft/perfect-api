import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private usersService: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        const request = context.switchToHttp().getRequest();

        if (request?.user) {
            const { id } = request.user;
            const user = await this.usersService.getUser(id);
            // console.log(user?.role)
            return user ? roles.includes(user.role) : false;
        }

        return false;
    }
}