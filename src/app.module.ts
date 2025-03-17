import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Serve the uploads folder
      serveRoot: '/uploads', // Base URL for static files
    }),
    MongooseModule.forRoot(process.env.DB_URI || ""),
    ProductsModule,
    UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule { }