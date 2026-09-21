import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 统一接口前缀
  app.setGlobalPrefix('api');
  // 开发期放开跨域
  app.enableCors();

  // 全局参数校验管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剔除 DTO 未声明的字段
      forbidNonWhitelisted: true, // 出现多余字段直接报 400
      transform: true, // 按 DTO 类型自动转换入参
    }),
  );

  // Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('智慧和解 API 文档')
    .setDescription('NestJS 接口 Demo —— 登录鉴权 + 用户管理 CRUD（RBAC）')
    .setVersion('1.1')
    .addBearerAuth() // 文档右上角 Authorize 可填 JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // 访问地址：/docs

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`服务已启动: http://localhost:${port}/api`);
  logger.log(`Swagger 文档: http://localhost:${port}/docs`);
}
bootstrap();
