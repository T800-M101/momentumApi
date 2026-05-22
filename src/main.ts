import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  
  app.enableCors({
    origin: 'http://localhost:4200', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Journal API')
    .setDescription('Documentación oficial del Diario Digital')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();
    
    const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
