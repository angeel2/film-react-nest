import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from 'node:path';

import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';
import { configProvider } from './app.config.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const driver = configService.get('DATABASE_DRIVER');
        const url = configService.get('DATABASE_URL');

        if (driver === 'mongodb' && url) {
          return { uri: url };
        }
        return { uri: 'mongodb://dummy', connectionFactory: () => null };
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(
        __dirname,
        '..',
        '..',
        'public',
        'content',
        'afisha',
      ),
      serveRoot: '/content/afisha',
    }),
    FilmsModule,
    OrderModule,
  ],
  providers: [configProvider],
})
export class AppModule {}
