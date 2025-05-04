import { Body, Controller, Get, Param, Post, Query, ValidationPipe } from '@nestjs/common';
import { OrdersService, ProductRequest } from './orders.service';
import { orderInfoDto } from './dto/creatOrderDto';
import { OrderInformation } from 'src/schemas/orderInfo.shema';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get(":num")
    findByClient(@Param('num') num: string, @Query('page') page: number): Promise<ProductRequest | null> {
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
}
