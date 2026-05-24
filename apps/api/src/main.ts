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
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log('--- [Bootstrap] Creating Nest application ---');
  const app = await NestFactory.create(AppModule);
  console.log('--- [Bootstrap] Nest application created ---');

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

  // Change these lines at the bottom of main.ts:
  const port = 8000; // 👈 Hardcode 8001 here to test
  console.log(`--- [Bootstrap] Listening on localhost:${port} ---`);
  await app.listen(port); // 👈 Remove '0.0.0.0'
  console.log(`--- [Bootstrap] API listening on localhost:${port} ---`);
}
bootstrap();