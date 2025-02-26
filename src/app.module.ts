import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI || ""),
    ProductsModule,
    UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule { }