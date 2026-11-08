import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('/etc/apache2/server_withpass.key'),
    cert: Buffer.concat([
      fs.readFileSync('/etc/apache2/razor-edge.net.pem'),
      fs.readFileSync('/etc/apache2/gsgccr3dvtlsca2020-x509.cer'),
    ]),
    //    key: fs.readFileSync('./cert/key.pem'),
    //    cert: fs.readFileSync('./cert/cert.pem'),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors({
    origin: 'https://razor-edge.net',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  //  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
