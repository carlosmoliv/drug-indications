import { Inject, Injectable, Logger } from '@nestjs/common';
import { GoogleGenAIService } from '../../../infra/services/ai/google-gen-ai.service';
import { ICD10Code } from './icd10-code.interface';

@Injectable()
export class Icd10Service {
  private readonly logger = new Logger(Icd10Service.name);

  constructor(
    private readonly aiService: GoogleGenAIService,
    @Inject('ICD10_DATA') private readonly icd10Data: ICD10Code[],
  ) {}

  async mapIndicationToICD10(
    indication: string,
    indicationDescription: string,
  ): Promise<string> {
    try {
      const prompt = this.buildPrompt(indication, indicationDescription);

      const code = await this.aiService.getResponse(prompt);

      const cleanedCode = code.trim().replace(/^"|"$/g, '').replace(/\./g, '');

      const validCode = this.icd10Data.find(
        (item) => item.code === cleanedCode,
      );

      if (validCode) {
        return cleanedCode;
      }

      this.logger.warn(
        `AI returned code ${cleanedCode} for ${indication}, but it's not in the dataset`,
      );

      return 'UNMAPPED';
    } catch (error) {
      this.logger.error(`Error mapping to ICD-10: ${error.message}`);
      return 'UNMAPPED';
    }
  }

  private buildPrompt(
    indication: string,
    indicationDescription: string,
  ): string {
    return `Map the medical condition to its ICD-10-CM code. Return ONLY the code with no additional text or explanation. 
      Condition name: ${indication}
      Additional information: ${indicationDescription}
      Format your response as a single ICD code in the format like A12.3`;
  }
}
