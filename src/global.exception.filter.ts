import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
} from '@nestjs/common';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('HTTP');

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();

        this.logger.error(
            `${request.method} ${request.url} ${status} - Error: ${exception.message}`,
        );

        response.status(status).json({
            statusCode: status,
            message: exception.message,
            error: exception.getResponse()['error'] || 'Unknown Error',
        });
    }
}