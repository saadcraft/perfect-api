import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UserSchema } from '../schemas/user.schema';
import { Profile, ProfileSchema } from '../schemas/profile.schema';
import { LocalStrategy } from './jwt/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: "123ABCD",
            signOptions: { expiresIn: '1h' },
        }),
        MongooseModule.forFeature([
            {
                name: Users.name,
                schema: UserSchema
            },
            {
                name: Profile.name,
                schema: ProfileSchema,
            },
        ]),
    ],
    controllers: [UsersController],
    providers: [UsersService, LocalStrategy, JwtStrategy]
})
export class UsersModule { }
