import { Test, TestingModule } from '@nestjs/testing';
import { HospitalManagerService } from './hospitalManager.service';

describe('HospitalManagerService', () => {
  let service: HospitalManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HospitalManagerService],
    }).compile();

    service = module.get<HospitalManagerService>(HospitalManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
