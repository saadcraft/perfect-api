import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, Query, ValidationPipe } from '@nestjs/common';
import { ProductsService } from "./products.service"
import { CreateProductDto } from "./dto/product.dto"
import { Products } from 'src/schemas/product.schema';
import { UpdateProductDto } from './dto/update.dto';
import mongoose from 'mongoose';

@Controller('products')
export class ProductsController {

    constructor(private readonly productsService: ProductsService) { }

    @Get() // GET /products
    findAll(@Query('category') category : string): Promise<Products[]>{
        return this.productsService.findAll(category)
    }

    @Get(':id') // GET /products/:id
    findOne(@Param('id') id : string){
        return this.productsService.findOne(id)
    }

    @Post() //POST /products
    create(@Body(ValidationPipe) product: CreateProductDto){
        return this.productsService.create(product)
    }

    @Patch(':id') //PATCH /products
    update(@Param('id') id : string, @Body(ValidationPipe) proUpdate : UpdateProductDto){
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);
        return this.productsService.update(id, proUpdate)
    }

    @Delete(':id')
    delete(@Param('id') id : string){
        return{ status: "deleted with succsusfuly", id }
    }

}
