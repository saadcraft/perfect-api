import { InjectModel } from "@nestjs/mongoose";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Model } from "mongoose";
import { Socket, Server } from 'socket.io';
import { OrderInformation } from "src/schemas/orderInfo.shema";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'magasine'
})
export class StoreSocket {

    constructor(
        @InjectModel(OrderInformation.name) private readonly orderModel: Model<OrderInformation>
    ) { }

    @WebSocketServer() server: Server;

    handleConnection(socket: Socket) {
        console.log(`magasine ${socket.data.user?.email} connected with ID: ${socket.id}`);

        if (socket.data.user?.dynamic) {
            const magasinRoom = `magasin_${socket.data.user.dynamic}`;
            socket.join(magasinRoom);

            this.orderModel.find({
                dynamic: socket.data.user.dynamic,
                status: "En attente"
            }).populate({ path: 'user', model: 'Profile', select: 'firstname lastname' })
                .then(pendingOrders => {
                    // pendingOrders.forEach(order => {
                    //     this.server.to(magasinRoom).emit("order_created", order);
                    // });
                    this.server.to(magasinRoom).emit("order_created", { type: "init", data: pendingOrders });
                });


            console.log(`User joined room: ${magasinRoom}`);
        }
    }

    // Example event (manual trigger from client)
    @SubscribeMessage('store')
    handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
        const magasinRoom = `magasin_${client.data.user?.dynamic}`;
        this.server.to(magasinRoom).emit('store', {
            name: client.id,
            message: data
        });
        return data;
    }

    notifyOrderCreated(order: OrderInformation) {
        const magasinRoom = `magasin_${order.dynamic}`;
        this.server.to(magasinRoom).emit('order_created', { type: "update", data: order });

    }

    notifyOrderClean(order: OrderInformation) {
        const magasinRoom = `magasin_${order.dynamic}`;
        this.server.to(magasinRoom).emit('order_created', { type: "delete", data: order });

    }
}