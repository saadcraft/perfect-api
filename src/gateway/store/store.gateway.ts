import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class StoreSocket {

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('store')
    handleEvent(
        @MessageBody() data: string,
        @ConnectedSocket() client: Socket,
    ): string {
        this.server.emit('store',
            {
                name: client.id,
                message: data
            }
        );
        return data
    }
}