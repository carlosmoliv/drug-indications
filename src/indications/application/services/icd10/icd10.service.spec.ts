import { Test, TestingModule } from '@nestjs/testing';
import { GoogleGenAIService } from '../../../infra/services/ai/google-gen-ai.service';
import icd10DataImport from '../../../../data/codes_icd10.json';
import { Icd10Service } from './icd10.service';

describe('Icd10Service', () => {
  let sut: Icd10Service;
  let aiServiceMock: jest.Mocked<GoogleGenAIService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Icd10Service,
        {
          provide: 'ICD10_DATA',
          useValue: icd10DataImport,
        },
        {
          provide: GoogleGenAIService,
          useValue: {
            getResponse: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = module.get<Icd10Service>(Icd10Service);
    aiServiceMock = module.get(GoogleGenAIService);
  });

  it('should return a valid code when AI returns a code in the dataset', async () => {
    aiServiceMock.getResponse.mockResolvedValue('A000');

    const result = await sut.mapIndicationToICD10('Cholera', 'diarrhea etc');

    expect(result).toBe('A000');
  });

  it('should return UNMAPPED and log warning if code is not in dataset', async () => {
    aiServiceMock.getResponse.mockResolvedValue('"Z999"');

    const result = await sut.mapIndicationToICD10(
      'FakeCondition',
      'some fake condition',
    );

    expect(result).toBe('UNMAPPED');
  });

  it('should return UNMAPPED and log error if AI service throws', async () => {
    aiServiceMock.getResponse.mockRejectedValue(new Error('AI is down'));

    const result = await sut.mapIndicationToICD10('Whatever', 'info');

    expect(result).toBe('UNMAPPED');
  });
});
