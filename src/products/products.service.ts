import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/product.dto'

@Injectable()
export class ProductsService {
    private products = [
        {
            id: 1,
            name: "pizza",
            category: "food",
            price: 2000
        }
    ];

    findAll(category) {
        if (category) {
            return this.products.filter(pro => pro.category === category)
        }
        return this.products
    }

    findOne(id: number){
        const product = this.products.find(pro => pro.id == id)
        return product
    }

    create(product : CreateProductDto){
        const productByHighestId = [...this.products].sort((a, b) => b.id - a.id)
        const newProduct = {
            id: productByHighestId[0].id + 1,
            ...product
        }
        this.products.push(newProduct)
        return newProduct
    }
}
