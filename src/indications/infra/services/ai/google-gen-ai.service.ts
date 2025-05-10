import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleGenAIService {
  private client: GoogleGenAI;
  private readonly model = 'gemini-2.0-flash';

  constructor(private readonly configService: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: this.configService.get('GOOGLE_GEN_API_KEY'),
    });
  }

  async getResponse(prompt: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
    });
    return response.data;
  }
}
