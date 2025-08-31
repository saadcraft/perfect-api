import { Injectable } from '@nestjs/common';
import { UpdateProductDto, VariantUpdateDto } from './dto/update.dto'
import { CreateProductDto } from './dto/product.dto'
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Products } from '../schemas/product.schema';
import { Variants } from 'src/schemas/variants.shema';
import { generateCombinationsFromOptions } from 'src/config/options';

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
        return this.productModel.findById(id).populate({ path: 'variants', model: 'Variants' });
    }

    async findVariants(id: string): Promise<Variants[] | null> {
        return this.ProductVariants.find({ product: new mongoose.Types.ObjectId(id) });
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

    async delete(id: string) {
        return this.productModel.findByIdAndDelete(id);
    }

    // async syncVariants(productId: string, variants: VariantsDto[] = [], removeVariantIds: string[] = []) {
    //     const product = await this.productModel.findById(productId);
    //     if (!product) throw new NotFoundException('Product not found');

    //     // 1. Remove variants if needed
    //     if (removeVariantIds.length > 0) {
    //         // Remove the variants from the Product's variants array
    //         await this.productModel.updateOne(
    //             { _id: productId },
    //             { $pull: { variants: { $in: removeVariantIds.map(id => new mongoose.Types.ObjectId(id)) } } }
    //         );

    //         // Also delete the variants from the Variants collection
    //         await this.ProductVariants.deleteMany({
    //             _id: { $in: removeVariantIds.map(id => new mongoose.Types.ObjectId(id)) }
    //         });
    //     }

    //     // 2. Add or update variants
    //     const updatedVariantIds: mongoose.Types.ObjectId[] = [];  // This will store the ObjectIds of the variants

    //     for (const variant of variants) {
    //         if (variant._id) {
    //             // Update existing variant
    //             await this.ProductVariants.findByIdAndUpdate(new mongoose.Types.ObjectId(variant._id), variant);  // Update the variant
    //             updatedVariantIds.push(new mongoose.Types.ObjectId(variant._id));  // Add ObjectId to updatedVariantIds
    //         } else {
    //             // Create a new variant
    //             const created = await this.ProductVariants.create(variant);
    //             updatedVariantIds.push(created._id as mongoose.Types.ObjectId);  // Add ObjectId of the newly created variant
    //         }
    //     }

    //     // 3. Merge existing variants with the new updated ones and remove the variants that need to be removed
    //     const existingVariantIds = product.variants.map((id) => id.toString());  // Get current variant IDs in string form

    //     // Filter out the variants that should be removed and that already exist in the product's variants
    //     const finalVariantIds = [
    //         ...existingVariantIds.filter((id) => !removeVariantIds.includes(id)),  // Remove the variants that are being removed
    //         ...updatedVariantIds.map(id => id.toString()).filter(id => !existingVariantIds.includes(id)) // Add new updated variants if not already present
    //     ];

    //     // Convert all string IDs to ObjectId instances
    //     const objectIds = finalVariantIds.map(id => new mongoose.Types.ObjectId(id));  // Convert to ObjectId using `new Types.ObjectId(id)`

    //     // Update the product's variants array with the new list of ObjectId[]s
    //     product.variants = objectIds;
    //     await product.save();

    //     return product;
    // }
}
