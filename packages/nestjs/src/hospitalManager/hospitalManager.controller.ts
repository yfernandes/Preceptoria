import { Controller } from '@nestjs/common';
import { HospitalManagerService } from './hospitalManager.service';

@Controller('hospital-manager')
export class HospitalManagerController {
  constructor(
    private readonly hospitalManagerService: HospitalManagerService,
  ) {}
}
