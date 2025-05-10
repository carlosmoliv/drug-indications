import { Module } from '@nestjs/common';
import { DailyMedService } from './application/services/dailymed/dailymed.service';
import { XmlParserService } from './infra/services/xml/xml-parser.service';
import { DailymedController } from './presentation/controllers/dailymed.controller';
import { DailyMedClient } from './infra/services/dailymed/dailymed-client.service';
import { GoogleGenAIService } from './infra/services/ai/google-gen-ai.service';
import { Icd10Service } from './application/services/icd10/icd10.service';
import icd10DataImport from '../data/codes_icd10.json';

@Module({
  providers: [
    DailyMedService,
    XmlParserService,
    DailyMedClient,
    GoogleGenAIService,
    Icd10Service,
    {
      provide: 'ICD10_DATA',
      useValue: icd10DataImport,
    },
  ],
  controllers: [DailymedController],
})
export class IndicationsModule {}
