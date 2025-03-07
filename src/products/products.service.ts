import { Injectable } from '@nestjs/common';
import { UpdateProductDto } from './dto/update.dto'
import { CreateProductDto } from './dto/product.dto'
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Products } from '../schemas/product.schema';

export type ProductRequest = {
    total: number;
    page: number;
    totalPages: number;
    result: Products[];
}

const limit = 4;

@Injectable()
export class ProductsService {

    constructor(
        @InjectModel(Products.name) private readonly productModel: mongoose.Model<Products>,
    ) { }

    async findAll(category?: string, page?: number): Promise<ProductRequest> {
        const skip = (page ? page - 1 : 0) * limit; // Calculate the offset
        if (category) {
            const data = await this.productModel.find({ category }).skip(skip).limit(limit);
            const total = await this.productModel.countDocuments({ category });
            return {
                total,
                page: Number(page) || 1,
                totalPages: Math.ceil(total / limit),
                result: data,
            }
        }
        const total = await this.productModel.countDocuments();
        const data = await this.productModel.find().skip(skip).limit(limit); // Calculate the offset;
        return {
            total,
            page: Number(page) || 1,
            totalPages: Math.ceil(total / limit),
            result: data,
        }
    }

    async findOne(id: string): Promise<Products | null> {
        return this.productModel.findById(id);
    }

    async create(product: CreateProductDto) {
        return this.productModel.create(product);
    }

    async update(id: string, params: UpdateProductDto) {
        return this.productModel.findByIdAndUpdate(id, params, { new: true });
    }

    async delete(id: string) {
        return this.productModel.findByIdAndDelete(id);
    }
}
