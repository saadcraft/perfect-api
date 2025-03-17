import { BadRequestException, Body, Controller, Delete, Get, HttpException, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ProductsService, ProductRequest } from "./products.service"
import { CreateProductDto } from "./dto/product.dto"
import { Products } from '../schemas/product.schema';
import { UpdateProductDto } from './dto/update.dto';
import mongoose from 'mongoose';
import { JwtAuthGuard } from '../users/jwt/jwt-auth.guard';
import { Roles } from 'src/users/auth/auth.decorator';
import { Role } from 'src/schemas/user.schema';
import { RolesGuard } from 'src/users/auth/role.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import * as fs from 'fs';
import * as path from 'path';

@Controller('products')
export class ProductsController {

    constructor(private readonly productsService: ProductsService) { }

    @Get() // GET /products
    findAll(@Query('category') category: string, @Query('title') title: string, @Query('page') page: number): Promise<ProductRequest> {
        return this.productsService.findAll({ title, category }, page);
    }

    @Get(':id') // GET /products/:id
    findOne(@Param('id') id: string): Promise<Products | null> {
        return this.productsService.findOne(id)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post() //POST /products
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], multerOptions),
    )
    async create(
        @Body(ValidationPipe) product: CreateProductDto,
        @UploadedFiles() files?: { images?: Express.Multer.File[] },
    ) {
        if (!files || !files.images || files.images.length === 0) {
            throw new BadRequestException({
                status: 400,
                message: 'At least one image is required',
                error: 'Bad Request',
            });
        }
        const images = files.images?.map((file) => file.path) || [];
        try {
            const newProduct = await this.productsService.create(product);

            const productDir = `./uploads/products/${newProduct._id}`;
            fs.mkdirSync(productDir, { recursive: true });

            const imagePaths = images.map((oldPath) => {
                const filename = path.basename(oldPath);
                const newPath = path.join(productDir, filename);
                fs.renameSync(oldPath, newPath); // Write buffer to file

                return `/uploads/products/${newProduct._id}/${filename}`;
            });

            await this.productsService.update(newProduct.id, { images: imagePaths });
            return { ...newProduct.toObject(), images: imagePaths };
        } catch (error) {
            throw new BadRequestException({
                status: 500,
                message: error,
                error: 'Bad Request',
            });
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id') //PATCH /products
    update(@Param('id') id: string, @Body(ValidationPipe) proUpdate: UpdateProductDto) {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);
        return this.productsService.update(id, proUpdate)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);
        const deleteUser = await this.productsService.delete(id);
        if (!deleteUser) throw new HttpException('Product Not Found', 404);
        return;
    }

}
