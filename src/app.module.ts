import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OrdersModule } from './orders/orders.module';
import { WilayaController } from './wilaya/wilaya.controller';
import { WilayaService } from './wilaya/wilaya.service';
import { WilayaModule } from './wilaya/wilaya.module';



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
    ProductsModule,
    UsersModule,
    OrdersModule,
    WilayaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
