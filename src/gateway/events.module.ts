import { Module } from "@nestjs/common";
import { StoreModule } from "./store/store.module";
import { ClientModule } from "./client/client.module";
import { DelivryModule } from "./delivry/delivry.module";
import { MessangerModule } from "./messanger/messanger.module";


@Module({
    imports: [StoreModule, ClientModule, DelivryModule, MessangerModule]
})
export class SocketsModule { }