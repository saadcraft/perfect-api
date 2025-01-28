import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/product.dto'
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Products } from 'src/schemas/product.schema';

@Injectable()
export class ProductsService {

    constructor(
        @InjectModel(Products.name) private readonly productModel: mongoose.Model<Products>,
      ) {}

    async findAll(category?: string): Promise<Products[]> {
        if(category){
            return this.productModel.find({ category }).exec();
         }
         return this.productModel.find().exec();
    }

    async findOne(id: string): Promise<Products | null>{
        return this.productModel.findById(id).exec()
    }

    async create(product : CreateProductDto){
        return await this.productModel.create(product)
    }
}
