import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { WilayaService } from './wilaya.service';
import mongoose from 'mongoose';
import { JwtAuthGuard } from 'src/users/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/users/auth/role.guard';
import { Roles } from 'src/users/auth/auth.decorator';
import { Role } from 'src/schemas/user.schema';
import { CreatWilayaDto } from './dto/updateWilayaDto';
import { CreatCommonDto, CreateCityDto } from './dto/creatWilayaDto';

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
    create(@Body() body: CreateCityDto) {
        return this.wilayaService.create(body);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post('common')
    createCommon(@Body() body: CreatCommonDto) {
        return this.wilayaService.createCommon(body);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(":id")
    update(@Param('id') id: string, @Body() body: CreatWilayaDto) {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);
        return this.wilayaService.update(id, body)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(":id")
    delete(@Param('id') id: string) {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);
        return this.wilayaService.delete(id)
    }

}
