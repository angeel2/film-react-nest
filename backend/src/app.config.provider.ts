import { ConfigModule } from '@nestjs/config';

export interface AppConfigDatabase {
  driver: string;
  url: string;
}

export interface AppConfig {
  database: AppConfigDatabase;
}

export const configProvider = {
  imports: [ConfigModule.forRoot()],
  provide: 'CONFIG',
  useFactory: (): AppConfig => {
    return {
      database: {
        driver: process.env.DATABASE_DRIVER || 'memory',
        url: process.env.DATABASE_URL || '',
      },
    };
  },
};
