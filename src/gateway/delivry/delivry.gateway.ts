import { InjectModel } from "@nestjs/mongoose";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Model } from "mongoose";
import { Socket, Server } from 'socket.io';
import { OrderInformation } from "src/schemas/orderInfo.shema";

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
export class DelivrySocket {

    @WebSocketServer()
    server: Server;

    constructor(
        @InjectModel(OrderInformation.name) private readonly orderModel: Model<OrderInformation>
    ) { }

    @SubscribeMessage('delivry')
    handleEvent(
        @MessageBody() data: string,
        @ConnectedSocket() client: Socket,
    ): string {
        this.server.emit('delivry',
            {
                name: client.id,
                message: data,
                from: 'delivry'
            }
        );
        return data
    }
}