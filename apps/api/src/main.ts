// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   // يجب وضع الـ Pipes قبل الـ listen
//   app.useGlobalPipes(new ValidationPipe({
//     whitelist: true,
//     forbidNonWhitelisted: true,
//     transform: true,
//   }));
//   await app.listen(process.env.PORT ?? 8000);
// }

// bootstrap();
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for Next.js frontend
  app.enableCors({
    origin: 'http://localhost:3000',   // your Next.js dev server URL
    credentials: true,                 // if you need to send cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();