import { Controller, Get } from '@nestjs/common';
import { DailyMedService } from '../../application/services/dailymed/dailymed.service';
import { Indication } from '../../domain/indication';

@Controller('indications')
export class DailymedController {
  private readonly DUPIXENT_SETID = '595f437d-2729-40bb-9c62-c8ece1f82780';

  constructor(private readonly dailymedService: DailyMedService) {}

  @Get()
  async getDrugIndications(): Promise<Indication[]> {
    return this.dailymedService.extractDrugIndications(this.DUPIXENT_SETID);
  }
}
