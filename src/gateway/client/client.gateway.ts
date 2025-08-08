import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class ClientSocket {

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('client')
    handleEvent(
        @MessageBody() data: string,
        @ConnectedSocket() client: Socket,
    ): string {
        this.server.emit('client',
            {
                name: client.id,
                message: data,
                from: 'client'
            }
        );
        return data
    }
}