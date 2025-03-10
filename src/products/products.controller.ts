import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ProductsService, ProductRequest } from "./products.service"
import { CreateProductDto } from "./dto/product.dto"
import { Products } from '../schemas/product.schema';
import { UpdateProductDto } from './dto/update.dto';
import mongoose from 'mongoose';
import { JwtAuthGuard } from '../users/jwt/jwt-auth.guard';
import { Roles } from 'src/users/auth/auth.decorator';
import { Role } from 'src/schemas/user.schema';
import { RolesGuard } from 'src/users/auth/role.guard';

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
    create(@Body(ValidationPipe) product: CreateProductDto) {
        return this.productsService.create(product)
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
