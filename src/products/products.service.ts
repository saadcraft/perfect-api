import { Injectable } from '@nestjs/common';
import { UpdateProductDto } from './dto/update.dto'
import { CreateProductDto } from './dto/product.dto'
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Products } from 'src/schemas/product.schema';

@Injectable()
export class ProductsService {

    constructor(
        @InjectModel(Products.name) private readonly productModel: mongoose.Model<Products>,
    ) { }

    async findAll(category?: string): Promise<Products[]> {
        if (category) {
            return this.productModel.find({ category });
        }
        return this.productModel.find();
    }

    async findOne(id: string): Promise<Products | null> {
        return this.productModel.findById(id);
    }

    async create(product: CreateProductDto) {
        return this.productModel.create(product)
    }

    async update(id: string, params: UpdateProductDto) {
        return this.productModel.findByIdAndUpdate(id, params, { new: true });
    }

    async delete(id: string) {
        return this.productModel.findByIdAndDelete(id);
    }
}
