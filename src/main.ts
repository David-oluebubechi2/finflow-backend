import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AppModule } from './app.module'
import { ALLOWED_ORIGINS } from './ws/cors'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: ALLOWED_ORIGINS } })
  app.useWebSocketAdapter(new IoAdapter(app))

  const port = Number(process.env.PORT ?? 3000)
  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`FinFlow WebSocket API ready → http://localhost:${port}`)
}
void bootstrap()