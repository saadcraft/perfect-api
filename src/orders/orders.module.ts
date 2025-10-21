import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderInformation, OrderInfoSchema } from 'src/schemas/orderInfo.shema';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Orders, OrdersSchema } from 'src/schemas/orders.shema';
import { ParsonalizerSchema, Parsonalizer } from 'src/schemas/personalizer';
import { StoreModule } from 'src/gateway/store/store.module';
import { Dynamic, DynamicSchema } from 'src/schemas/dynamic.shema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: OrderInformation.name, schema: OrderInfoSchema },
    { name: Orders.name, schema: OrdersSchema },
    { name: Parsonalizer.name, schema: ParsonalizerSchema },
    { name: Dynamic.name, schema: DynamicSchema },
  ]), UsersModule, StoreModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule { }
