import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderInformation, OrderInfoSchema } from 'src/schemas/orderInfo.shema';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Orders, OrdersSchema } from 'src/schemas/orders.shema';
import { ParsonalizerSchema, Parsonalizer } from 'src/schemas/personalizer';

@Module({
  imports: [MongooseModule.forFeature([
    { name: OrderInformation.name, schema: OrderInfoSchema },
    { name: Orders.name, schema: OrdersSchema },
    { name: Parsonalizer.name, schema: ParsonalizerSchema },
  ]), UsersModule],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule { }
