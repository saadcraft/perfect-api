import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreatUserDto } from './dto/creatUser.dto';
import { LocalAuthGuard } from './jwt/local-auth.guard';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('register')
    create(@Body(ValidationPipe) user: CreatUserDto) {
        return this.usersService.create(user)
    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Request() req) {
        return req.user;
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    getUser(@Param('id') id: string) {
        return this.usersService.getUser(id)
    }

}
