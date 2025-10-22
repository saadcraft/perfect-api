import { Body, Controller, Get, Post, UseGuards, ValidationPipe, Req, Res, Patch } from '@nestjs/common';
import { Response, Request } from 'express';
import { UsersService } from './users.service';
import { CreatUserDto, ProfileDto } from './dto/creatUser.dto';
import { LocalAuthGuard } from './jwt/local-auth.guard';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    getUser(@Req() req: Request) {
        const userId = (req.user as any)?.id || (req.user as any)?._id;
        return this.usersService.getUser(userId)
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: Request) {
        const userId = (req.user as any)?.id || (req.user as any)?._id;
        return this.usersService.getProfile(userId)
    }

    @Post('register')
    create(@Body(ValidationPipe) user: CreatUserDto) {
        return this.usersService.create(user)
    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Req() req, @Res({ passthrough: true }) res: Response) {

        res.cookie('access_token', req.user.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 60 minutes
        });

        res.cookie('refresh_token', req.user.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return req.user;
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return { message: 'Logged out' };
    }

    @Post('refresh')
    async refreshUser(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        // console.log(refreshToken)
        const refresh = await this.usersService.refreshUser(refreshToken)
        res.cookie('access_token', refresh.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 60 minutes
        });

        res.cookie('refresh_token', refresh.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return refresh;
    }

    @Post('profile')
    @UseGuards(JwtAuthGuard)
    async CreateProfile(@Req() req: Request, @Body(ValidationPipe) createProfile: ProfileDto) {
        const userId = (req.user as any)?.id || (req.user as any)?._id;
        return this.usersService.creatProfile(userId, createProfile)
    }

    @Patch()
    @UseGuards(JwtAuthGuard)
    async UpdateUser(@Req() req: Request, @Body(ValidationPipe) userUpdate: UpdateUserDto) {
        const userId = (req.user as any)?.id || (req.user as any)?._id;
        return this.usersService.update(userId, userUpdate)
    }

}
