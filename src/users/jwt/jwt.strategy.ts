import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req?.cookies['access_token'],
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.SECRET_KEY || "DEFAULT=493156290a5d9b7e209b9952748961d0",
        });
    }

    async validate(payload: PayloadType) {
        return payload;
    }
}