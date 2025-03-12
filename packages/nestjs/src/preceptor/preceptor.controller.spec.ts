import { Test, TestingModule } from '@nestjs/testing';
import { PreceptorController } from './preceptor.controller';

describe('PreceptorController', () => {
  let controller: PreceptorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreceptorController],
    }).compile();

    controller = module.get<PreceptorController>(PreceptorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
