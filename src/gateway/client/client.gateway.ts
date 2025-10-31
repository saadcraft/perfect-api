import { InjectModel } from "@nestjs/mongoose";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Model } from "mongoose";
import { Socket, Server } from 'socket.io';
import { OrderInformation } from "src/schemas/orderInfo.shema";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'client'
})
export class ClientSocket {

    constructor(
        @InjectModel(OrderInformation.name) private readonly orderModel: Model<OrderInformation>
    ) { }

    @WebSocketServer() server: Server;

    handleConnection(socket: Socket) {
        console.log(`User ${socket.data.user?.email} connected with ID: ${socket.id}`);

        if (socket.data.user?.dynamic) {
            const clientRoom = `client_${socket.data.user.id}`;
            socket.join(clientRoom);

            this.orderModel.find({
                user: socket.data.user.profile,
                status: "En attente"
            }).populate({ path: 'dynamic', model: 'Dynamic', select: 'magasine' })
                .then(pendingOrders => {
                    // pendingOrders.forEach(order => {
                    //     this.server.to(magasinRoom).emit("order_created", order);
                    // });
                    this.server.to(clientRoom).emit("order_pedding", pendingOrders);
                });


            console.log(`User joined room: ${clientRoom}`);
        }
    }

    @SubscribeMessage('client')
    handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
        const magasinRoom = `client_${client.data.user?._id}`;
        this.server.to(magasinRoom).emit('client', {
            name: client.id,
            message: data
        });
        return data;
    }



}