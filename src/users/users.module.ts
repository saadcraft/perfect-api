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
import { ConfigModule } from '@nestjs/config';



@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PassportModule,
        JwtModule.register({
            secret: process.env.SECRET_KEY || "DEFAULT=493156290a5d9b7e209b9952748961d0",
            signOptions: { expiresIn: '10s' },
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
    providers: [UsersService, LocalStrategy, JwtStrategy],
    exports: [UsersService]
})
export class UsersModule { }
