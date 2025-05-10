import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndicationsModule } from './indications/indications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().optional(),
        GOOGLE_GEN_API_KEY: Joi.string().required(),
      }),
    }),
    IndicationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
