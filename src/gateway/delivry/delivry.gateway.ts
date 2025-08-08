import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class DelivrySocket {

    @WebSocketServer()
    server: Server;

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