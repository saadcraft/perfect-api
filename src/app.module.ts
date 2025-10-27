import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OrdersModule } from './orders/orders.module';
import { WilayaModule } from './wilaya/wilaya.module';
import { DynamicModule } from './dynamic/dynamic.module';
import { SocketsModule } from './gateway/events.module';
import { SocketAuthMiddleware } from './config/socket-auth.middleware';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.SECRET_KEY || "DEFAULT=493156290a5d9b7e209b9952748961d0",
      signOptions: { expiresIn: '10m' },
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
    DynamicModule,
    SocketsModule
  ],
  controllers: [],
  providers: [SocketAuthMiddleware],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {
  }
}
