import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SocketAuthMiddleware {
    constructor(private jwtService: JwtService) { }

    // Socket.IO middleware format
    async use(socket: any, next: (err?: Error) => void) {
        try {
            // Get token from handshake
            const token = this.extractToken(socket);

            // console.log(token)

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            // Verify token
            const user = await this.jwtService.verifyAsync(token);

            // Attach user to socket
            socket.data.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    }

    private extractToken(socket: any): string | null {
        // Try different ways to get the token
        const authHeader = socket.handshake.headers.authorization;
        if (authHeader) {
            return authHeader.replace('Bearer ', '');
        }

        // Also check auth object (if using auth property)
        const authToken = socket.handshake.auth.token;
        if (authToken) {
            return authToken.replace('Bearer ', '');
        }

        return null;
    }
}