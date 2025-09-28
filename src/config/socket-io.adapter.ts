import { IoAdapter } from '@nestjs/platform-socket.io';

export class SocketIOAdapter extends IoAdapter {
    private authMiddleware: any;

    constructor(app: any, authMiddleware: any) {
        super(app);
        this.authMiddleware = authMiddleware;
    }

    create(port: number, options?: any) {
        const server = super.create(port, options);

        // Apply authentication middleware to all connections
        server.use((socket: any, next: any) => {
            this.authMiddleware.use(socket, next);
        });

        return server;
    }
}