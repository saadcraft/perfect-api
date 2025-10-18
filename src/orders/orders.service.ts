import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { OrderInformation } from 'src/schemas/orderInfo.shema';
import { Orders } from 'src/schemas/orders.shema';
import { orderInfoDto } from './dto/creatOrderDto';
import { updateOrderDto } from './dto/updateOrderDto';
import { Parsonalizer } from 'src/schemas/personalizer';
import { StoreSocket } from 'src/gateway/store/store.gateway';

export type OrderRequest = {
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
        @InjectModel(Parsonalizer.name) private readonly PersonalizerModel: mongoose.Model<Parsonalizer>,
        private readonly storeSocket: StoreSocket
    ) { }

    async findByClient(phoneNumber: string, page?: number): Promise<OrderRequest | null> {
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
                populate: [
                    {
                        path: 'variant',
                        model: 'Variants',
                        populate: {
                            path: 'product',
                            model: 'Products',
                            populate: {
                                path: 'dynamic',
                                model: 'Dynamic'
                            }
                        },

                    },
                    {
                        path: 'parsonalizer',
                        model: 'Parsonalizer',
                    },
                ]
            },
        ]);
    }

    // async findManyByOrders(ids: string[]): Promise<OrderInformation[]> {
    //     return this.OrderInfoModel.find({
    //         _id: { $in: ids },
    //     }).populate([
    //         {
    //             path: 'orders',
    //             model: 'Orders',
    //             populate: [
    //                 {
    //                     path: 'variant',
    //                     model: 'Variants',
    //                     populate: {
    //                         path: 'product',
    //                         model: 'Products',
    //                         populate: {
    //                             path: 'dynamic',
    //                             model: 'Dynamic',
    //                         },
    //                     },
    //                 },
    //                 {
    //                     path: 'parsonalizer',
    //                     model: 'Parsonalizer',
    //                 },
    //             ],
    //         },
    //     ]);
    // }

    async findAll(filters: { number?: string; user?: string; status?: string }, page?: number): Promise<OrderRequest | null> {
        const skip = (page ? page - 1 : 0) * limit; // Calculate the offset
        const query: { [key: string]: any } = {};
        if (filters.user?.trim()) {
            query.user = filters.user.trim();
        }
        if (filters.status?.trim()) {
            query.status = filters.status.trim();
        }

        if (filters.number?.trim()) {
            const searchTerm = filters.number.trim();
            const regexPattern = searchTerm.split('').join('.*');
            query.phoneNumber = { $regex: regexPattern, $options: 'i' };
        }
        const [data, total] = await Promise.all([
            this.OrderInfoModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({ path: 'orders', model: 'Orders' }),
            this.OrderInfoModel.countDocuments(query)
        ]);
        return {
            total,
            page: Number(page) || 1,
            totalPages: Math.ceil(total / limit),
            result: data,
        }
    }

    async findByMagasine(req: PayloadType, filters: { number?: string; user?: string; status?: string }, page?: number): Promise<OrderRequest | null> {
        const skip = (page ? page - 1 : 0) * limit; // Calculate the offset
        const query: { [key: string]: any } = {};
        if (filters.user?.trim()) {
            query.user = filters.user.trim();
        }
        if (filters.status?.trim()) {
            query.status = filters.status.trim();
        }

        if (filters.number?.trim()) {
            const searchTerm = filters.number.trim();
            const regexPattern = searchTerm.split('').join('.*');
            query.phoneNumber = { $regex: regexPattern, $options: 'i' };
        }
        if (req) {
            query.dynamic = req.dynamic;
        }

        // console.log(query)
        const [data, total] = await Promise.all([
            this.OrderInfoModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({ path: 'orders', model: 'Orders' }),
            this.OrderInfoModel.countDocuments(query)
        ]);
        return {
            total,
            page: Number(page) || 1,
            totalPages: Math.ceil(total / limit),
            result: data,
        }
    }

    async create({ orders, ...orderinfo }: orderInfoDto) {
        const createdOrderInfo = await this.OrderInfoModel.create({ ...orderinfo, user: orderinfo.user.id });

        let personalizerId: mongoose.Types.ObjectId | null = null;

        for (const order of orders) {
            if (order.parsonalizer) {
                const createdPersonalizer = await this.PersonalizerModel.create(order.parsonalizer);
                personalizerId = createdPersonalizer._id as mongoose.Types.ObjectId;
            }
        }

        const createOrders = await this.OrdersModel.insertMany(orders.map(order => ({
            ...order,
            orderInfo: createdOrderInfo.id,
            parsonalizer: personalizerId
        })));


        createdOrderInfo.items = createOrders.map(o => o._id as mongoose.Types.ObjectId);
        await createdOrderInfo.save();
        this.storeSocket.notifyOrderCreated({ orders, ...orderinfo });

        return createdOrderInfo;

    }

    async update(id: string, order: updateOrderDto) {
        return this.OrderInfoModel.findByIdAndUpdate(id, order, { new: true });
    }

}
