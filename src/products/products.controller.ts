import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    ValidationPipe
} from '@nestjs/common';
import { Request } from 'express';
import { ProductsService, ProductRequest } from "./products.service"
import { CreateProductDto, VariantsDto } from "./dto/product.dto"
import { Products } from '../schemas/product.schema';
import { UpdateProductDto, VariantUpdateDto } from './dto/update.dto';
import mongoose from 'mongoose';
import { JwtAuthGuard } from '../users/jwt/jwt-auth.guard';
import { Roles } from 'src/users/auth/auth.decorator';
import { Role } from 'src/schemas/user.schema';
import { RolesGuard } from 'src/users/auth/role.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import * as fs from 'fs';
import * as path from 'path';
import { Variants } from 'src/schemas/variants.shema';

@Controller('products')
export class ProductsController {

    constructor(private readonly productsService: ProductsService) { }

    @Get() // GET /products
    findAll(@Query('category') category: string, @Query('title') title: string, @Query('page') page: number): Promise<ProductRequest> {
        return this.productsService.findAll({ title, category }, page);
    }

    @UseGuards(JwtAuthGuard)
    @Get('app')
    findApp(@Query('category') category: string, @Query('title') title: string, @Query('page') page: number, @Req() req: Request): Promise<ProductRequest> {
        if (req.user && (req.user as PayloadType).role === Role.USER) {
            return this.productsService.findAll({ title, category }, page);
        }
        return this.productsService.findMagasinProduct(req.user as PayloadType, { title, category }, page)
    }

    @Get(':id') // GET /products/:id
    findOne(@Param('id') id: string): Promise<Products | null> {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);
        return this.productsService.findOne(id)
    }

    @Get('variants/:id')
    findVariants(@Param("id") id: string): Promise<Variants[] | null> {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);
        return this.productsService.findVariants(id)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MAGASINE)
    @Post() //POST /products
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], multerOptions),
    )
    async create(
        @Body(ValidationPipe) product: CreateProductDto,
        @Req() req: Request,
        @UploadedFiles() files?: { images?: Express.Multer.File[] },
    ) {
        if (!files || !files.images || files.images.length === 0) {
            throw new BadRequestException({
                status: 400,
                message: 'At least one image is required',
                error: 'Bad Request',
            });
        }
        try {
            const images = files.images.map((file) => ({
                path: file.path,
                originalFilename: file.originalname, // Store the original filename
            }));

            console.log(req.user);

            const newProduct = await this.productsService.create(product, req.user as PayloadType);

            const productDir = `${process.env.UPLOAD_DIR}/products/${newProduct._id}`;
            fs.mkdirSync(productDir, { recursive: true });

            const imagePaths = images.map(({ path: oldPath, originalFilename }) => {
                const filename = path.basename(oldPath); // Get the generated filename
                const newPath = path.join(productDir, filename);
                fs.renameSync(oldPath, newPath); // Move the file to the new directory

                return {
                    newPath: `/uploads/products/${newProduct._id}/${filename}`,
                    originalFilename, // Keep the original filename for reference
                };
            });

            const primaryImage = imagePaths.find((img) => img.originalFilename === product.primaryImage)?.newPath || imagePaths[0].newPath;


            await this.productsService.update(newProduct.id, { images: imagePaths.map((img) => img.newPath), primaryImage });
            return { ...newProduct.toObject(), images: imagePaths };
        } catch (error) {
            throw new BadRequestException({
                status: 500,
                message: error.message,
                error: 'Bad Request',
            });
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MAGASINE)
    @Patch(':id') //PATCH /products
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], multerOptions),
    )
    async update(@Param('id') id: string, @Body(ValidationPipe)
    proUpdate: UpdateProductDto,
        @UploadedFiles() files?: { images?: Express.Multer.File[] }
    ) {
        // console.log(proUpdate)
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);

        const product = await this.productsService.findOne(id);
        if (!product) throw new NotFoundException('Product not found');

        // let variantsIds = product.variants || [];
        let imagePaths = product.images || [];
        let NewprimaryImage: string | null = null

        if (files && files.images && files.images.length > 0) {
            const productDir = `${process.env.UPLOAD_DIR}/products/${product._id}`;
            fs.mkdirSync(productDir, { recursive: true });

            const newImages = files.images.map((file) => {
                const filename = path.basename(file.path);
                const newPath = path.join(productDir, filename);
                fs.renameSync(file.path, newPath);

                return {
                    newPath: `/uploads/products/${product._id}/${filename}`,
                    originalFilename: file.originalname,
                };
            });
            // Append new image paths
            imagePaths = [...imagePaths, ...newImages.map((img) => img.newPath)];
            NewprimaryImage = proUpdate.newPrimaryImage && newImages.find((img) => img.originalFilename === proUpdate.newPrimaryImage)?.newPath || null;
        }
        if (proUpdate.removeImage && Array.isArray(proUpdate.removeImage)) {
            imagePaths = imagePaths.filter((img) => !proUpdate.removeImage?.includes(img))

            for (const imgPath of proUpdate.removeImage) {
                const localPath = path.join('.', imgPath); // Make sure the path is correct
                if (fs.existsSync(localPath)) {
                    fs.unlinkSync(localPath);
                }
            }
        }
        const primaryImage = proUpdate.oldPrimaryImage || NewprimaryImage || (imagePaths.includes(product.primaryImage) ? product.primaryImage : imagePaths[0]);

        // if (proUpdate.variants || proUpdate.removeVariant) {
        //     await this.productsService.syncVariants(
        //         id,
        //         proUpdate.variants || [],
        //         proUpdate.removeVariant || []
        //     );
        // }
        // Destructure to remove variants & removeVariant from proUpdate

        const updatePayload = {
            ...proUpdate,
            images: imagePaths,
            primaryImage,
        };

        return this.productsService.update(id, updatePayload)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MAGASINE)
    @Patch('variants/:id')
    updateVariants(@Param('id') id: string, @Body(ValidationPipe) body: VariantUpdateDto) {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);
        return this.productsService.updateVariants(id, body);

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
