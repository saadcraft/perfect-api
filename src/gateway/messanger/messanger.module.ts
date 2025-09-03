import { Module } from "@nestjs/common";
import { MessangerSocket } from "./messanger.gateway";


@Module({
    providers: [MessangerSocket]
})
export class MessangerModule { }