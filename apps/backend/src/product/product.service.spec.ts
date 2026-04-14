import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { ProductService } from './product.service';
import { Product } from './schemas/product.schema';
import { CategoryProduct } from '../category-product/schemas/category-product.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('ProductService audit logging', () => {
  let service: ProductService;
  let saveMock: jest.Mock;
  let findOneMock: jest.Mock;
  let findOneAndDeleteMock: jest.Mock;
  let categoryModel: { findOne: jest.Mock };
  let auditLogService: { create: jest.Mock };

  beforeEach(async () => {
    saveMock = jest.fn();
    findOneMock = jest.fn();
    findOneAndDeleteMock = jest.fn();
    categoryModel = { findOne: jest.fn() };
    auditLogService = { create: jest.fn() };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function ProductModel(this: any, payload: any) {
      Object.assign(this, payload);
      this.save = saveMock;
      this.toObject = () => ({ ...payload });
    }
    (ProductModel as any).findOne = findOneMock;
    (ProductModel as any).findOneAndDelete = findOneAndDeleteMock;

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getModelToken(Product.name), useValue: ProductModel as unknown as Partial<Model<any>> },
        { provide: getModelToken(CategoryProduct.name), useValue: { findOne: categoryModel.findOne } },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    service = moduleRef.get(ProductService);
  });

  it('create() writes an audit log row', async () => {
    categoryModel.findOne.mockReturnValue({ exec: () => Promise.resolve({ _id: 'cat1' }) });
    saveMock.mockResolvedValue({ _id: 'p1' });

    await service.create(
      // minimal fields used by service
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { name: 'N', description: 'D', category: 'cat1', stock: 1 } as any,
      't1',
      { tenantId: 't1', userId: 'u1', userEmail: 'u@example.com' },
      'en',
    );

    expect(auditLogService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 't1',
        userId: 'u1',
        userEmail: 'u@example.com',
        action: 'CREATE',
        entity: 'Product',
        entityId: 'p1',
      }),
    );
  });

  it('update() writes an audit log row', async () => {
    const doc = {
      name: 'Old',
      description: 'OldD',
      toObject: () => ({ _id: 'p1', name: 'Old', description: 'OldD' }),
      save: jest.fn().mockResolvedValue(undefined),
    };
    findOneMock
      .mockReturnValueOnce({ exec: () => Promise.resolve(doc) })
      .mockReturnValueOnce({ populate: () => ({ exec: () => Promise.resolve({ _id: 'p1' }) }) });

    await service.update(
      'p1',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { name: 'New' } as any,
      't1',
      { tenantId: 't1', userId: 'u1', userEmail: 'u@example.com' },
      'en',
    );

    expect(auditLogService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE',
        entity: 'Product',
        entityId: 'p1',
      }),
    );
  });

  it('remove() writes an audit log row', async () => {
    findOneAndDeleteMock.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve({ _id: 'p1', name: 'N', stock: 0 }) }),
    });

    await service.remove('p1', 't1', { tenantId: 't1', userId: 'u1', userEmail: 'u@example.com' });

    expect(auditLogService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELETE',
        entity: 'Product',
        entityId: 'p1',
      }),
    );
  });
});

