import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI || ""),
    ProductsModule],
  controllers: [UsersController],
  providers: [],
})
export class AppModule {}