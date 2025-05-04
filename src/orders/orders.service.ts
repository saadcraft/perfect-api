import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { OrderInformation } from 'src/schemas/orderInfo.shema';
import { Orders } from 'src/schemas/orders.shema';
import { orderInfoDto } from './dto/creatOrderDto';

export type ProductRequest = {
    total: number;
    page: number;
    totalPages: number;
    result: OrderInformation[];
}

const limit = 10;

@Injectable()
export class OrdersService {

    constructor(
        @InjectModel(OrderInformation.name) private readonly OrderInfoModel: mongoose.Model<OrderInformation>,
        @InjectModel(Orders.name) private readonly OrdersModel: mongoose.Model<Orders>,
    ) { }

    async findByClient(phoneNumber: string, page?: number): Promise<ProductRequest | null> {
        const skip = (page ? page - 1 : 0) * limit;

        const data = await this.OrderInfoModel.find({ phoneNumber }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate({ path: 'orders', model: 'Orders' });
        const total = await this.OrderInfoModel.countDocuments({ phoneNumber });

        return {
            total,
            page: Number(page) || 1,
            totalPages: Math.ceil(total / limit),
            result: data,
        }

    }

    async findByOrder(id: string): Promise<OrderInformation | null> {
        return this.OrderInfoModel.findById(id).populate([
            {
                path: 'orders',
                model: 'Orders',
                populate: {
                    path: 'variant',
                    model: 'Variants',
                    populate: {
                        path: 'product',
                        model: 'Products',
                    },
                },
            },
        ]);
    }

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
