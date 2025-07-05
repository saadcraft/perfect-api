import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './global.exception.filter';
import { LoggingInterceptor } from './logging.interceptor';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // console.log("env: " + process.env.DB_URI)

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  // app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  app.use(cookieParser());

  app.enableCors({
    origin: (origin, callback) => {
      callback(null, origin); // reflect the request origin
    },
    credentials: true,
  });

  await app.listen(8001, '0.0.0.0', () => {
    console.log('Server running on port 8000');
  });
}
bootstrap();
