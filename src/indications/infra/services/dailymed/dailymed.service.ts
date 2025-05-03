import { Injectable } from '@nestjs/common';
import { Indication } from '../../../domain/indication';

import icd10Data from '../../../../data/codes_icd10.json';
import { DailyMedClient } from './dailymed-client.service';
import { XmlParserService } from '../xml-parser/xml-parser.service';

interface ICD10Entry {
  code: string;
  description: string;
}

@Injectable()
export class DailyMedService {
  private readonly DUPIXENT_SETID = '595f437d-2729-40bb-9c62-c8ece1f82780';

  constructor(
    private readonly dailyMedClient: DailyMedClient,
    private readonly xmlService: XmlParserService,
  ) {}

  async getDrugIndications(setId = this.DUPIXENT_SETID): Promise<Indication[]> {
    const xmlData = await this.dailyMedClient.getLabelXmlBySetId(setId);
    const parsedXml = this.xmlService.parse(xmlData);

    const indicationsData = this.extractIndications(parsedXml);

    const indications = indicationsData.map(({ title, description }) => {
      const normalizedTitle = title.replace(/^\d+\.\d+\t/, '').trim();
      const icdCode = 'A001'; // TODO: Implement AI mapping to ICD-10-CM code
      return new Indication(normalizedTitle, description, icdCode);
    });

    return indications;
  }

  private extractIndications(parsedXml): {
    title: string;
    description: string;
  }[] {
    const structuredBody = parsedXml.document.component.structuredBody;
    const indicationsSection = structuredBody?.component?.find(
      (comp: any) =>
        comp.section && comp?.section?.title === '1 INDICATIONS AND USAGE',
    );
    const indicationComponents = indicationsSection.section.component;

    return indicationComponents.map((component) => {
      const title = component.section.title || '';
      let description = '';

      const text = component.section.text;
      if (typeof text.paragraph === 'string') {
        description = text.paragraph.trim();
      } else if (
        typeof text.paragraph === 'object' &&
        text.paragraph['#text']
      ) {
        description = text.paragraph['#text'].trim();
      } else if (
        typeof text.paragraph === 'object' &&
        typeof text.paragraph.content === 'string'
      ) {
        description = text.paragraph.content.trim();
      }

      return { title, description };
    });
  }
}
