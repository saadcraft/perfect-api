import { Module } from "@nestjs/common";
import { ClientSocket } from "./client.gateway";


@Module({
    providers: [ClientSocket]
})
export class ClientModule { }