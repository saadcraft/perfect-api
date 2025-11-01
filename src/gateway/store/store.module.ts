import { Module } from "@nestjs/common";
import { StoreSocket } from "./store.gateway";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderInformation, OrderInfoSchema } from "src/schemas/orderInfo.shema";


@Module({
    imports: [MongooseModule.forFeature([{ name: OrderInformation.name, schema: OrderInfoSchema }])],
    providers: [StoreSocket],
    exports: [StoreSocket]
})
export class StoreModule { }