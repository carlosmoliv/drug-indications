import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DailyMedClient {
  private readonly logger = new Logger(DailyMedClient.name);
  private readonly DAILYMED_API_URL =
    'https://dailymed.nlm.nih.gov/dailymed/services/v2/spls';

  async getLabelXmlBySetId(setId: string): Promise<string> {
    try {
      const url = `${this.DAILYMED_API_URL}/${setId}.xml`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching drug label for setId ${setId}: ${error.message}`,
      );
      throw error;
    }
  }
}
