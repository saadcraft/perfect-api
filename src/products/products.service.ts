import { Injectable } from '@nestjs/common';
import { UpdateProductDto } from './dto/update.dto'
import { CreateProductDto } from './dto/product.dto'
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Products } from '../schemas/product.schema';
import { Variants } from 'src/schemas/variants.shema';

export type ProductRequest = {
    total: number;
    page: number;
    totalPages: number;
    result: Products[];
}

const limit = 10;

@Injectable()
export class ProductsService {

    constructor(
        @InjectModel(Products.name) private readonly productModel: mongoose.Model<Products>,
        @InjectModel(Variants.name) private ProductVariants: mongoose.Model<Variants>,
    ) { }

    async findAll(filters: { title?: string; category?: string }, page?: number): Promise<ProductRequest> {
        const skip = (page ? page - 1 : 0) * limit; // Calculate the offset
        const query: { [key: string]: any } = {};
        if (filters.category && filters.category.trim()) {
            query.category = filters.category.trim();
        }
        if (filters.title && filters.title.trim()) {
            const searchTerm = filters.title.trim();
            const regexPattern = searchTerm.split('').join('.*'); // Basic approximation for fuzzy matching
            query.title = { $regex: regexPattern, $options: 'i' };
        }
        const data = await this.productModel.find({ ...query, available: true }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await this.productModel.countDocuments({ ...query, available: true });
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

    async create({ variants, ...product }: CreateProductDto, images?: string[]) {
        const newVariants = await this.ProductVariants.insertMany(variants)
        return this.productModel.create({ variants: newVariants.map(v => v._id), ...product, images });
    }

    async update(id: string, params: UpdateProductDto) {
        return this.productModel.findByIdAndUpdate(id, params, { new: true });
    }

    async delete(id: string) {
        return this.productModel.findByIdAndDelete(id);
    }
}
