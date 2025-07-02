import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OrdersModule } from './orders/orders.module';
import { WilayaModule } from './wilaya/wilaya.module';
import { DynamicModule } from './dynamic/dynamic.module';


console.log("test" + process.env.DB_URI)
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Serve the uploads folder
      serveRoot: '/uploads', // Base URL for static files
    }),
    MongooseModule.forRoot(process.env.DB_URI || ""),
    // MongooseModule.forRoot("mongodb://perfectAdmin:PIratage@1996@127.0.0.1:27017/perfectdb?authSource=perfectdb"),
    ProductsModule,
    UsersModule,
    OrdersModule,
    WilayaModule,
    DynamicModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
