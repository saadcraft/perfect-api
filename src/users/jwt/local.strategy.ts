import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UsersService) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.userService.validateUser({ username, password });
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}