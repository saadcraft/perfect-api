import { Test, TestingModule } from '@nestjs/testing';
import { WilayaController } from './wilaya.controller';

describe('WilayaController', () => {
  let controller: WilayaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WilayaController],
    }).compile();

    controller = module.get<WilayaController>(WilayaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
