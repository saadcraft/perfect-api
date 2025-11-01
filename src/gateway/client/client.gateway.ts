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

        if (socket.data.user?.id) {
            const clientRoom = `client_${socket.data.user.profile}`;
            socket.join(clientRoom);

            const excludedStatuses = ["completed", "annulé"];

            this.orderModel.find({
                user: socket.data.user.profile,
                status: { $nin: excludedStatuses }
            }).populate({ path: 'dynamic', model: 'Dynamic', select: 'magasine' })
                .then(pendingOrders => {
                    // pendingOrders.forEach(order => {
                    //     this.server.to(magasinRoom).emit("order_created", order);
                    // });
                    this.server.to(clientRoom).emit("order_pedding", { type: "init", data: pendingOrders });
                });


            console.log(`User joined room: ${clientRoom}`);
        }
    }

    @SubscribeMessage('client')
    handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
        const magasinRoom = `client_${client.data.user?.profile}`;
        this.server.to(magasinRoom).emit('client', {
            name: client.id,
            message: data
        });
        return data;
    }

    notifyOrderUpdate(order: OrderInformation, message: string) {
        console.log(`here we go client_${order.user._id}`)
        const clientRoom = `client_${order.user._id}`;
        this.server.to(clientRoom).emit('order_pedding', { type: "update", message, data: order });
    }

    notifyOrderEnd(order: OrderInformation) {
        const clientRoom = `client_${order.user._id}`;
        this.server.to(clientRoom).emit('order_pedding', { type: "delete", data: order });
    }

}