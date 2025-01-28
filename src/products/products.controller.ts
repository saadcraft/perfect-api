import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ValidationPipe } from '@nestjs/common';
import { ProductsService } from "./products.service"
import { CreateProductDto } from "./dto/product.dto"
import { Products } from 'src/schemas/product.schema';

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
    update(@Param('id') id : string, @Body() proUpdate : {}){
        return { id , ...proUpdate }
    }

    @Delete(':id')
    delete(@Param('id') id : string){
        return{ status: "deleted with succsusfuly", id }
    }

}
