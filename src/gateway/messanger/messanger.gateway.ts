import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: false,
    },
    transports: ['websocket', 'polling'],
    namespace: '/messenger',
})
export class MessangerSocket {

    @WebSocketServer()
    server: Server;

    private connectedUsers = new Map<string, { userId: string, username: string }>();

    // handleConnection(client: Socket) {
    //     console.log(`Client connected: ${client.id}`);

    //     this.server.emit('userJoin', {
    //         message: `New User join : , ${client.id}`,
    //     });
    // }

    @SubscribeMessage("registerUser")
    handleRegisterUser(client: Socket, payload: { username: string; userId: string }) {
        this.connectedUsers.set(client.id, payload);

        console.log(`User registered: ${payload.username} (${client.id})`);

        const onlineUsers = Array.from(this.connectedUsers.values());
        client.emit('onlineUsers', onlineUsers);

        client.broadcast.emit("userJoin", {
            message: `New User joined: ${payload.username}`,
            ...payload
        });
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.server.emit('userLeft', {
            message: `User left : , ${client.id}`,
        });
        this.connectedUsers.delete(client.id);
    }

    @SubscribeMessage("privateMessage")
    handlePrivateMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { toUserId: string; text: string }
    ) {
        // Find sender by client.id
        const sender = this.connectedUsers.get(client.id);
        if (!sender) return;

        // Find recipient by userId (search the map values)
        const recipientEntry = Array.from(this.connectedUsers.entries())
            .find(([_, user]) => user.userId === payload.toUserId);

        if (!recipientEntry) {
            console.log("Recipient not found or offline");
            return;
        }

        const [recipientSocketId, recipient] = recipientEntry;

        // Send message only to recipient
        this.server.to(recipientSocketId).emit("privateMessage", {
            from: sender.userId,
            text: payload.text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isOwn: false
        });

        // Send a copy back to sender so they see it in their chat
        client.emit("privateMessage", {
            from: sender.userId,
            text: payload.text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isOwn: true
        });
    }

    @SubscribeMessage('typing')
    handleTyping(
        @MessageBody() data: { chatId: string; username: string },
        @ConnectedSocket() client: Socket
    ) {
        const sender = this.connectedUsers.get(client.id);
        if (!sender) return;

        // Find recipient by userId (search the map values)
        const recipientEntry = Array.from(this.connectedUsers.entries())
            .find(([_, user]) => user.userId === data.chatId);

        if (!recipientEntry) {
            console.log("Recipient not found or offline");
            return;
        }

        const [recipientSocketId, recipient] = recipientEntry;
        client.broadcast.to(recipientSocketId).emit('userTyping', { user: data.username, chatId: sender.userId });
    }

    // User stops typing
    @SubscribeMessage('stopTyping')
    handleStopTyping(
        @MessageBody() data: { chatId: string; username: string },
        @ConnectedSocket() client: Socket
    ) {
        const sender = this.connectedUsers.get(client.id);
        if (!sender) return;

        // Find recipient by userId (search the map values)
        const recipientEntry = Array.from(this.connectedUsers.entries())
            .find(([_, user]) => user.userId === data.chatId);

        if (!recipientEntry) {
            console.log("Recipient not found or offline");
            return;
        }

        const [recipientSocketId, recipient] = recipientEntry;
        client.broadcast.to(recipientSocketId).emit('userStopTyping', { user: data.username, chatId: sender.userId });
    }
}