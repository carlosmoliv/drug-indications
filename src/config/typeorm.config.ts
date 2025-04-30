import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

config();
const configService = new ConfigService();

export const dataSourceOptions = {
  type: 'postgres' as const,
  url: configService.get<string>('DATABASE_URL'),
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') !== 'prod',
  migrationsTableName: 'typeorm_migrations',
  migrations: ['dist/migrations/**', '*.js'],
  entities: ['dist/**/*.entity.js'],
  migrationsRun: false,
};

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    return dataSourceOptions;
  },
};

export default new DataSource(dataSourceOptions);
