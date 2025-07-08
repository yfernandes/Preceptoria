import { Test, TestingModule } from '@nestjs/testing';
import { PreceptorService } from './preceptor.service';

describe('PreceptorService', () => {
  let service: PreceptorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreceptorService],
    }).compile();

    service = module.get<PreceptorService>(PreceptorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
