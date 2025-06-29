import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductDto } from '../../products/dto/product.dto';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        try {

            console.log("🟢 Raw Request Body:", req);

            const body = plainToInstance(CreateProductDto, req.body);
            console.log("🟡 DTO Transformed Body:", body);

            const errors = await validate(body);

            if (errors.length > 0) {
                throw new BadRequestException(errors);
            }

            next();
        } catch (error) {
            throw new BadRequestException({
                status: 400,
                message: 'Validation failed',
                errors: error.message,
            });
        }
    }
}