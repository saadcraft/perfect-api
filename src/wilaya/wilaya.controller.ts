import { Body, Controller, Get, HttpException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { WilayaService } from './wilaya.service';
import mongoose from 'mongoose';
import { JwtAuthGuard } from 'src/users/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/users/auth/role.guard';
import { Roles } from 'src/users/auth/auth.decorator';
import { Role } from 'src/schemas/user.schema';
import { CreateWilayasDto } from './dto/creatWilayaDto';

@Controller('wilaya')
export class WilayaController {
    constructor(private readonly wilayaService: WilayaService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    findAll(@Query('wilaya') wilaya: number, @Query('page') page: number) {
        return this.wilayaService.findAll({ wilaya }, page)
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);
        return this.wilayaService.findOne(id)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    create(@Body() body: CreateWilayasDto) {
        return this.wilayaService.create(body.wilayas);
    }

}
