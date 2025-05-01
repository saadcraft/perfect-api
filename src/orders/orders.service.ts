import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { OrderInformation } from 'src/schemas/orderInfo.shema';
import { Orders } from 'src/schemas/orders.shema';
import { orderInfoDto } from './dto/creatOrderDto';

@Injectable()
export class OrdersService {

    constructor(
        @InjectModel(OrderInformation.name) private readonly OrderInfoModel: mongoose.Model<OrderInformation>,
        @InjectModel(Orders.name) private readonly OrdersModel: mongoose.Model<Orders>,
    ) { }

    async create({ orders, ...orderinfo }: orderInfoDto) {
        const createdOrderInfo = await this.OrderInfoModel.create(orderinfo);

        const createOrders = await this.OrdersModel.insertMany(orders.map(order => ({
            ...order,
            orderInfo: createdOrderInfo.id
        })));

        createdOrderInfo.orders = createOrders.map(o => o._id as mongoose.Types.ObjectId);
        await createdOrderInfo.save();

        return createdOrderInfo;

    }

}
