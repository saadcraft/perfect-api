import { Module } from "@nestjs/common";
import { DelivrySocket } from "./delivry.gateway";


@Module({
    providers: [DelivrySocket]
})
export class DelivryModule { }