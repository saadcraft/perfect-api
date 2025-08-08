import { Module } from "@nestjs/common";
import { StoreModule } from "./store/store.module";
import { ClientModule } from "./client/client.module";
import { DelivryModule } from "./delivry/delivry.module";


@Module({
    imports: [StoreModule, ClientModule, DelivryModule]
})
export class SocketsModule { }