import { Module } from "@nestjs/common";
import { StoreSocket } from "./store.gateway";


@Module({
    providers: [StoreSocket]
})
export class StoreModule { }