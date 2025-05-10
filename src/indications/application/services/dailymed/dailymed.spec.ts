import { Test, TestingModule } from '@nestjs/testing';
import { DailyMedService } from './dailymed.service';
import { DailyMedClient } from '../../../infra/services/dailymed/dailymed-client.service';
import { XmlParserService } from '../../../infra/services/xml/xml-parser.service';
import { Indication } from '../../../domain/indication';
import { Icd10Service } from '../icd10.service';
import { mockXml } from './mock-xml';
import { mockParsedXml } from './mock-parsed-xml';

describe('DailyMedService', () => {
  let sut: DailyMedService;
  let dailyMedClient: jest.Mocked<DailyMedClient>;
  let xmlParserService: jest.Mocked<XmlParserService>;
  let icd10Service: jest.Mocked<Icd10Service>;

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
        {
          provide: Icd10Service,
          useValue: {
            mapIndicationToICD10: jest.fn().mockImplementation((indication) => {
              if (indication.includes('Dermatitis')) {
                return 'L20.89';
              }
              if (indication.includes('Asthma')) {
                return 'J45.909';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    sut = module.get<DailyMedService>(DailyMedService);
    dailyMedClient = module.get(DailyMedClient);
    xmlParserService = module.get(XmlParserService);
    icd10Service = module.get(Icd10Service);
  });

  describe('getDrugIndications', () => {
    it('should extract indications from valid XML', async () => {
      const indications = await sut.extractDrugIndications(
        '595f437d-2729-40bb-9c62-c8ece1f82780',
      );

      expect(indications).toHaveLength(2);
      expect(indications[0]).toEqual(
        new Indication(
          'Atopic Dermatitis',
          'DUPIXENT is indicated for the treatment of adult and pediatric patients aged 6 months and older with moderate-to-severe atopic dermatitis...',
          'L20.89',
        ),
      );
      expect(indications[1]).toEqual(
        new Indication(
          'Asthma',
          'DUPIXENT is indicated as an add-on maintenance treatment of adult and pediatric patients aged 6 years and older with moderate-to-severe asthma...',
          'J45.909',
        ),
      );

      expect(dailyMedClient.getLabelXmlBySetId).toHaveBeenCalledWith(
        '595f437d-2729-40bb-9c62-c8ece1f82780',
      );
      expect(xmlParserService.parse).toHaveBeenCalledWith(mockXml);
      expect(icd10Service.mapIndicationToICD10).toHaveBeenCalledTimes(2);
    });
  });
});
