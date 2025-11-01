import { Module } from "@nestjs/common";
import { ClientSocket } from "./client.gateway";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderInformation, OrderInfoSchema } from "src/schemas/orderInfo.shema";


@Module({
    imports: [MongooseModule.forFeature([{ name: OrderInformation.name, schema: OrderInfoSchema }])],
    providers: [ClientSocket],
    exports: [ClientSocket]
})
export class ClientModule { }