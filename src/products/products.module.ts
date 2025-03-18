import {
  // MiddlewareConsumer,
  Module,
  // NestModule, 
  // RequestMethod
} from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Products, ProductSchema } from '../schemas/product.schema';
// import { LoggerMiddleware } from '../lib/middleware/logger.middleware';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Products.name, schema: ProductSchema }]), UsersModule],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule { // Add implements NestModule for apply middleware
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(LoggerMiddleware)
  //     .forRoutes(
  //       { path: 'products', method: RequestMethod.POST },
  //     )
  // }
}
