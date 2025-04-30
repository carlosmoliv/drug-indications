import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmTestConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  autoLoadEntities: true,
  logging: false,
};
