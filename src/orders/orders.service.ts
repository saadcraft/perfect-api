import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { OrderInformation, OrderWithTotal } from 'src/schemas/orderInfo.shema';
import { Orders } from 'src/schemas/orders.shema';
import { orderInfoDto } from './dto/creatOrderDto';
import { updateOrderDto } from './dto/updateOrderDto';
import { Parsonalizer } from 'src/schemas/personalizer';
import { StoreSocket } from 'src/gateway/store/store.gateway';
import { Dynamic } from 'src/schemas/dynamic.shema';
import path from 'path';
import { ClientSocket } from 'src/gateway/client/client.gateway';

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
        @InjectModel(Dynamic.name) private readonly DynamicModel: mongoose.Model<Dynamic>,
        private readonly storeSocket: StoreSocket,
        private readonly clientSocket: ClientSocket
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

    async findByOrder(id: string, view?: boolean): Promise<OrderInformation | null> {

        const order = await this.OrderInfoModel.findById(id).populate([
            {
                path: 'items',
                model: 'Orders',
                populate: [
                    {
                        path: 'variant',
                        model: 'Variants',
                        populate: {
                            path: 'product',
                            model: 'Products',
                        },
                    },
                    {
                        path: 'parsonalizer',
                        model: 'Parsonalizer',
                    },
                ],
            },
            {
                path: 'dynamic',
                populate: {
                    path: 'common'
                }
            },
            {
                path: 'user',
            }
        ]);

        if (!order) return null;

        if (view) {
            order.view = view;
            await order.save();
            const message = `${(order.dynamic as any)?.magasine} Voir votre commande`
            this.clientSocket.notifyOrderUpdate(order, message);
        }

        return order;
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
                .populate({ path: 'items', model: 'Orders' }),
            this.OrderInfoModel.countDocuments(query)
        ]);
        return {
            total,
            page: Number(page) || 1,
            totalPages: Math.ceil(total / limit),
            result: data,
        }
    }

    async findByUser(req: PayloadType, filters: { number?: string; status?: string }, page?: number): Promise<OrderRequest | null> {
        const skip = (page ? page - 1 : 0) * limit; // Calculate the offset
        const query: { [key: string]: any } = {};
        if (filters.status?.trim()) {
            query.status = filters.status.trim();
        }

        if (filters.number?.trim()) {
            const searchTerm = filters.number.trim();
            const regexPattern = searchTerm.split('').join('.*');
            query.phoneNumber = { $regex: regexPattern, $options: 'i' };
        }
        if (req) {
            query.user = req.profile;
        }

        // console.log(query)
        const [data, total] = await Promise.all([
            this.OrderInfoModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate([{
                    path: 'dynamic', model: 'Dynamic', populate: {
                        path: 'common', model: 'Common'
                    }
                },
                { path: 'items', model: 'Orders', select: 'quantity price' }]
                ),
            this.OrderInfoModel.countDocuments(query)
        ]);
        return {
            total,
            page: Number(page) || 1,
            totalPages: Math.ceil(total / limit),
            result: data,
        }
    }

    async create({ items, ...orderinfo }: orderInfoDto) {
        const dynamic = await this.DynamicModel.findById(orderinfo.dynamic).populate({
            path: 'common', populate: {
                path: 'city'
            }
        });

        if (!dynamic) {
            throw new BadRequestException({
                status: 400,
                message: 'Invalide magasine',
                error: 'Bad Request',
            });
        }

        const updatedCommon = await this.DynamicModel.db
            .collection('commons')
            .findOneAndUpdate(
                { _id: dynamic.common._id },
                { $inc: { count: 1 } },
                { returnDocument: 'after' }
            );
        const prefix = (dynamic?.common as any)?.city?.code_city + (dynamic?.common as any).code_common;
        const sequence = updatedCommon?.count;
        const orderId = `${prefix}${String(sequence).padStart(5, '0')}`;

        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0) + ((dynamic?.common as any)?.price_delivry || 0);

        const createdOrderInfo = await this.OrderInfoModel.create({ ...orderinfo, user: orderinfo.user.id, orderId, total });

        let personalizerId: mongoose.Types.ObjectId | null = null;

        for (const item of items) {
            if (item.parsonalizer) {
                const createdPersonalizer = await this.PersonalizerModel.create(item.parsonalizer);
                personalizerId = createdPersonalizer._id as mongoose.Types.ObjectId;
            }
        }

        const createOrders = await this.OrdersModel.insertMany(items.map(order => ({
            ...order,
            orderInfo: createdOrderInfo.id,
            parsonalizer: personalizerId
        })));


        createdOrderInfo.items = createOrders.map(o => o._id as mongoose.Types.ObjectId);
        await createdOrderInfo.save();
        this.storeSocket.notifyOrderCreated({
            _id: createdOrderInfo._id,
            orderId, view: false,
            status: "En attente",
            items: createdOrderInfo.items,
            createdAt: createdOrderInfo?.createdAt!,
            ...orderinfo
        } as unknown as OrderInformation);

        return createdOrderInfo;

    }

    async update(id: string, order: updateOrderDto) {
        return this.OrderInfoModel.findByIdAndUpdate(id, order, { new: true });
    }

}
