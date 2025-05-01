import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { orderInfoDto } from './dto/creatOrderDto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post() //POST /orders
    async create(@Body(ValidationPipe) order: orderInfoDto) {
        return this.ordersService.create(order)
    }
}
