import { Injectable } from '@nestjs/common';
import { UpdateProductDto, VariantUpdateDto } from './dto/update.dto'
import { CategoryDto, CreateProductDto } from './dto/product.dto'
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Products } from '../schemas/product.schema';
import { Variants } from 'src/schemas/variants.shema';
import { generateCombinationsFromOptions } from 'src/config/options';
import path from 'path';
import { Categories } from 'src/schemas/categories.shema';

export type ProductRequest = {
    total: number;
    page: number;
    totalPages: number;
    result: Products[];
}

const limit = 20;

@Injectable()
export class ProductsService {

    constructor(
        @InjectModel(Products.name) private readonly productModel: mongoose.Model<Products>,
        @InjectModel(Variants.name) private readonly ProductVariants: mongoose.Model<Variants>,
        @InjectModel(Categories.name) private readonly ProductCategorie: mongoose.Model<Categories>,
    ) { }

    async findAll(filters: { title?: string; category?: string }, dynamic?: string, page?: number): Promise<ProductRequest> {
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
        if (dynamic) {
            query.dynamic = dynamic;
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

    async findMagasinProduct(req: PayloadType, filters: { title?: string; category?: string }, page?: number): Promise<ProductRequest> {
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
        const data = await this.productModel.find({ ...query, available: true, dynamic: req.dynamic }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await this.productModel.countDocuments({ ...query, available: true, dynamic: req.dynamic });
        return {
            total,
            page: Number(page) || 1,
            totalPages: Math.ceil(total / limit),
            result: data,
        }
    }

    async findOne(id: string): Promise<Products | null> {
        return this.productModel.findById(id).populate([
            { path: 'variants', model: 'Variants' },
            {
                path: 'dynamic', model: 'Dynamic', populate: {
                    path: 'heroPictures', model: 'HeroPictures'
                }
            }
        ]);
    }

    async findVariants(id: string): Promise<Variants[] | null> {
        return this.ProductVariants.find({ product: new mongoose.Types.ObjectId(id) });
    }

    async variantFindProduct(ids: string[]): Promise<Variants[]> {
        return this.ProductVariants.find({
            _id: { $in: ids },
        }).populate({
            path: 'product',
            model: 'Products',
            populate: {
                path: 'dynamic',
                model: 'Dynamic',
            },
        })
    }

    async create(product: CreateProductDto, req: PayloadType, images?: string[]) {
        // 1. Create the product first
        const createdProduct = await this.productModel.create({
            ...product,
            dynamic: req.dynamic,
            images
        });

        const CombinatVariants = generateCombinationsFromOptions(product.attributes);

        // 2. Insert variants with the product ID included
        const newVariants = await this.ProductVariants.insertMany(
            CombinatVariants.map(v => {
                return {
                    ...v,
                    product: createdProduct._id,
                    price: product.lowPrice
                }
            })
        );

        // 3. Update the product with the variant IDs
        createdProduct.variants = newVariants.map(v => v._id as mongoose.Types.ObjectId);
        await createdProduct.save();

        return createdProduct;
    }

    async update(id: string, params: UpdateProductDto) {
        return this.productModel.findByIdAndUpdate(id, params, { new: true });
    }

    async updateVariants(id: string, variants: VariantUpdateDto) {
        const price: number[] = [];
        const updatedVariants = await Promise.all(
            variants.updates.map(async variant => {
                const updateQuery = variants.removeAttribut ? {
                    $unset: { quntity: "" },
                    $set: { ...variant, quntity: undefined }, // Avoid sending `quantity` with undefined
                } : {
                    $set: variant,
                };
                const updated = await this.ProductVariants.findByIdAndUpdate(variant.id, updateQuery, { new: true })
                price.push(variant.price)
                return updated;
            }
            )
        );
        const lowestPrice = Math.min(...price);

        this.update(id, { lowPrice: lowestPrice })

        return updatedVariants;
    }

    async creatCategorie(data: CategoryDto) {
        return this.ProductCategorie.create(data)
    }

    async getCategories() {
        return this.ProductCategorie.find()
    }

    async delete(id: string) {
        return this.productModel.findByIdAndDelete(id);
    }


}
