import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Wilayas } from 'src/schemas/wilayas.shema';
import { WilayaDto } from './dto/creatWilayaDto';
import { CreatWilayaDto } from './dto/updateWilayaDto';

export type WilayaRequest = {
    total: number;
    page: number;
    totalPages: number;
    result: Wilayas[];
}

const limit = 20;

@Injectable()
export class WilayaService {
    constructor(@InjectModel(Wilayas.name) readonly wilayaModule: mongoose.Model<Wilayas>) { }

    async findAll(filters: { wilaya?: number }, page?: number): Promise<WilayaRequest> {
        const skip = (page ? page - 1 : 0) * limit; // Calculate the offset
        const query: { [key: string]: any } = {};
        if (filters.wilaya && filters.wilaya) {
            query.$or = [
                { code_send: filters.wilaya },
                { code_recieve: filters.wilaya }
            ];
        }
        const data = await this.wilayaModule.find({ ...query, available: true }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await this.wilayaModule.countDocuments({ ...query, available: true });
        return {
            total,
            page: Number(page) || 1,
            totalPages: Math.ceil(total / limit),
            result: data,
        }
    }

    async findOne(id: string): Promise<Wilayas | null> {
        return this.wilayaModule.findById(id);
    }

    async create(wilayas: WilayaDto[]): Promise<Wilayas[] | null> {

        const createWilaya = await this.wilayaModule.insertMany(wilayas.map(wilaya => ({
            ...wilaya
        })));

        return createWilaya;
    }

    async update(id: string, body: CreatWilayaDto): Promise<Wilayas | null> {
        return this.wilayaModule.findByIdAndUpdate(id, body, { new: true })
    }

    async delete(id: string) {
        return this.wilayaModule.findByIdAndDelete(id)
    }
}
