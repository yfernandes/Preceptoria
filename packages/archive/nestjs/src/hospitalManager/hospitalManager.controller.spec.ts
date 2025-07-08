import { Test, TestingModule } from '@nestjs/testing';
import { HospitalManagerController } from './hospitalManager.controller';
import { HospitalManagerService } from './hospitalManager.service';

describe('HospitalManagerController', () => {
  let controller: HospitalManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HospitalManagerController],
      providers: [HospitalManagerService],
    }).compile();

    controller = module.get<HospitalManagerController>(
      HospitalManagerController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
