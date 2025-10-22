import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { CreatCommonDto, CreateCityDto } from './dto/creatWilayaDto';
import { CreatWilayaDto } from './dto/updateWilayaDto';
import { Cities } from 'src/schemas/cities.shema';
import { Common } from 'src/schemas/common.shema';

export type WilayaRequest = {
    total: number;
    page: number;
    totalPages: number;
    result: Cities[];
}

const limit = 20;

@Injectable()
export class WilayaService {
    constructor(
        @InjectModel(Cities.name) readonly wilayaModule: mongoose.Model<Cities>,
        @InjectModel(Common.name) readonly CommonModule: mongoose.Model<Common>
    ) { }

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

    async findOne(id: string): Promise<Cities | null> {
        return this.wilayaModule.findById(id);
    }

    async create(city: CreateCityDto): Promise<Cities | null> {
        return this.wilayaModule.create(city);
    }

    async createCommon(common: CreatCommonDto): Promise<Common | null> {
        const city = await this.wilayaModule.findById(common.city)
        if (!city) {
            throw new BadRequestException({
                status: 400,
                message: 'This wilaya didn\'t exist',
                error: 'Bad Request',
            });
        }
        const newCommon = await this.CommonModule.create({ ...common, city: new mongoose.Types.ObjectId(common.city) });

        city.common = [...city.common, new mongoose.Types.ObjectId(newCommon._id as any)]

        await city.save()
        return newCommon
    }

    async update(id: string, body: CreatWilayaDto): Promise<Cities | null> {
        return this.wilayaModule.findByIdAndUpdate(id, body, { new: true })
    }

    async delete(id: string) {
        return this.wilayaModule.findByIdAndDelete(id)
    }
}
