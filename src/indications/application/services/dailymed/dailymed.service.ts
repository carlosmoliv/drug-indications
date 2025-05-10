import { Injectable } from '@nestjs/common';
import { Indication } from '../../../domain/indication';
import { XmlParserService } from '../../../infra/services/xml/xml-parser.service';
import { DailyMedClient } from '../../../infra/services/dailymed/dailymed-client.service';
import { Icd10Service } from '../icd10/icd10.service';

@Injectable()
export class DailyMedService {
  constructor(
    private readonly dailyMedClient: DailyMedClient,
    private readonly xmlService: XmlParserService,
    private readonly icd10MappingService: Icd10Service,
  ) {}

  async extractDrugIndications(setId: string): Promise<Indication[]> {
    const xmlData = await this.dailyMedClient.getLabelXmlBySetId(setId);
    const parsedXml = this.xmlService.parse(xmlData);

    const indicationsData = this.extractIndicationsRawData(parsedXml);

    const indications = indicationsData.map(async ({ title, description }) => {
      const normalizedTitle = title.replace(/^\d+\.\d+\t/, '').trim();

      const icdCode = await this.icd10MappingService.mapIndicationToICD10(
        normalizedTitle,
        description,
      );

      return new Indication(normalizedTitle, description, icdCode);
    });
    return Promise.all(indications);
  }

  private extractIndicationsRawData(parsedXml): {
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
