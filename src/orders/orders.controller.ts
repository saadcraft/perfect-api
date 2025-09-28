import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { OrderRequest, OrdersService } from './orders.service';
import { orderInfoDto } from './dto/creatOrderDto';
import { OrderInformation } from 'src/schemas/orderInfo.shema';
import { JwtAuthGuard } from '../users/jwt/jwt-auth.guard';
import { Roles } from 'src/users/auth/auth.decorator';
import { Role } from 'src/schemas/user.schema';
import { RolesGuard } from 'src/users/auth/role.guard';
import { updateOrderDto } from './dto/updateOrderDto';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MAGASINE)
    @Get() //Get get all orders for ADMIN
    findByMagasine(@Req() req: Request, @Query('user') user: string, @Query('phoneNumber') number: string, @Query('status') status: string, @Query('page') page: number): Promise<OrderRequest | null> {
        // console.log(req.user);
        if (req.user && (req.user as PayloadType).role === Role.USER) {
            return this.ordersService.findAll({ number, user, status }, page);
        }
        return this.ordersService.findByMagasine(req.user as PayloadType, { number, user, status }, page);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MAGASINE)
    @Get("all") //Get get all orders for ADMIN
    findAll(@Query('user') user: string, @Query('phoneNumber') number: string, @Query('status') status: string, @Query('page') page: number): Promise<OrderRequest | null> {
        return this.ordersService.findAll({ number, user, status }, page);
    }

    @Get(":num")
    findByClient(@Param('num') num: string, @Query('page') page: number): Promise<OrderRequest | null> {
        return this.ordersService.findByClient(num, page);
    }

    @Get("info/:id")
    findOne(@Param("id") id: string): Promise<OrderInformation | null> {
        return this.ordersService.findByOrder(id);
    }

    @Post() //POST /orders
    async create(@Body(ValidationPipe) order: orderInfoDto) {
        return this.ordersService.create(order)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    async update(@Param("id") id: string, @Body() order: updateOrderDto) {
        return this.ordersService.update(id, order);
    }
}
