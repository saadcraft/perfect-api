import { Module } from "@nestjs/common";
import { DelivrySocket } from "./delivry.gateway";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderInformation, OrderInfoSchema } from "src/schemas/orderInfo.shema";


@Module({
    imports: [MongooseModule.forFeature([{ name: OrderInformation.name, schema: OrderInfoSchema }])],
    providers: [DelivrySocket]
})
export class DelivryModule { }