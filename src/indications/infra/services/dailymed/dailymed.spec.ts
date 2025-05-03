import { Test, TestingModule } from '@nestjs/testing';
import { DailyMedService } from './dailymed.service';
import { DailyMedClient } from './dailymed-client.service';
import { XmlParserService } from '../xml-parser/xml-parser.service';
import { Indication } from '../../../domain/indication';

describe('DailyMedService', () => {
  let sut: DailyMedService;
  let dailyMedClient: DailyMedClient;
  let xmlParserService: XmlParserService;

  const mockXml = `
    <document>
      <component>
        <structuredBody>
          <component>
            <section>
              <title>1 INDICATIONS AND USAGE</title>
              <component>
                <section>
                  <title>1.1 Atopic Dermatitis</title>
                  <text>
                    <paragraph>DUPIXENT is indicated for the treatment of adult and pediatric patients aged 6 months and older with moderate-to-severe atopic dermatitis...</paragraph>
                  </text>
                </section>
              </component>
              <component>
                <section>
                  <title>1.2 Asthma</title>
                  <text>
                    <paragraph>DUPIXENT is indicated as an add-on maintenance treatment of adult and pediatric patients aged 6 years and older with moderate-to-severe asthma...</paragraph>
                  </text>
                </section>
              </component>
            </section>
          </component>
        </structuredBody>
      </component>
    </document>
  `;

  const mockParsedXml = {
    document: {
      component: {
        structuredBody: {
          component: [
            {
              section: {
                title: '1 INDICATIONS AND USAGE',
                component: [
                  {
                    section: {
                      title: '1.1\tAtopic Dermatitis',
                      text: {
                        paragraph:
                          'DUPIXENT is indicated for the treatment of adult and pediatric patients aged 6 months and older with moderate-to-severe atopic dermatitis...',
                      },
                    },
                  },
                  {
                    section: {
                      title: '1.2\tAsthma',
                      text: {
                        paragraph:
                          'DUPIXENT is indicated as an add-on maintenance treatment of adult and pediatric patients aged 6 years and older with moderate-to-severe asthma...',
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyMedService,
        {
          provide: DailyMedClient,
          useValue: {
            getLabelXmlBySetId: jest.fn().mockResolvedValue(mockXml),
          },
        },
        {
          provide: XmlParserService,
          useValue: {
            parse: jest.fn().mockReturnValue(mockParsedXml),
          },
        },
      ],
    }).compile();

    sut = module.get<DailyMedService>(DailyMedService);
    dailyMedClient = module.get<DailyMedClient>(DailyMedClient);
    xmlParserService = module.get<XmlParserService>(XmlParserService);
  });

  describe('getDrugIndications', () => {
    it('should extract indications from valid XML', async () => {
      const indications = await sut.getDrugIndications(
        '595f437d-2729-40bb-9c62-c8ece1f82780',
      );

      expect(indications).toHaveLength(2);
      expect(indications[0]).toEqual(
        new Indication(
          'Atopic Dermatitis',
          'DUPIXENT is indicated for the treatment of adult and pediatric patients aged 6 months and older with moderate-to-severe atopic dermatitis...',
          'A001',
        ),
      );
      expect(indications[1]).toEqual(
        new Indication(
          'Asthma',
          'DUPIXENT is indicated as an add-on maintenance treatment of adult and pediatric patients aged 6 years and older with moderate-to-severe asthma...',
          'A001',
        ),
      );
      expect(dailyMedClient.getLabelXmlBySetId).toHaveBeenCalledWith(
        '595f437d-2729-40bb-9c62-c8ece1f82780',
      );
      expect(xmlParserService.parse).toHaveBeenCalledWith(mockXml);
    });
  });
});
