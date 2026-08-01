import { CategoryRepository } from '../category.repository';
import { CatalogService } from '../catalog.service';
import { ProductRepository } from '../product.repository';
import type { ShopPort } from '../../shop/shop.port';

describe('CatalogService', () => {
  let service: CatalogService;
  let categoryRepository: { findTree: jest.Mock };
  let productRepository: {
    findMany: jest.Mock;
    findBySlug: jest.Mock;
    findByIdWithOwner: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    deactivate: jest.Mock;
    createVariant: jest.Mock;
    findVariantWithOwner: jest.Mock;
    updateVariant: jest.Mock;
  };
  let shopPort: { findByOwnerId: jest.Mock };

  const ownerId = 1;
  const otherOwnerId = 2;
  const baseProduct = { id: 10, shop: { ownerId } };

  beforeEach(() => {
    categoryRepository = { findTree: jest.fn() };
    productRepository = {
      findMany: jest.fn(),
      findBySlug: jest.fn(),
      findByIdWithOwner: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
      createVariant: jest.fn(),
      findVariantWithOwner: jest.fn(),
      updateVariant: jest.fn(),
    };
    shopPort = { findByOwnerId: jest.fn() };

    service = new CatalogService(
      categoryRepository as unknown as CategoryRepository,
      productRepository as unknown as ProductRepository,
      shopPort as unknown as ShopPort,
    );
  });

  describe('getCategoryTree', () => {
    it('delegates to the category repository', async () => {
      categoryRepository.findTree.mockResolvedValue([{ id: 1, children: [] }]);

      const result = await service.getCategoryTree();

      expect(result).toEqual([{ id: 1, children: [] }]);
      expect(categoryRepository.findTree).toHaveBeenCalled();
    });
  });

  describe('listProducts', () => {
    it('defaults status to active when not provided', async () => {
      productRepository.findMany.mockResolvedValue({ items: [], total: 0 });

      await service.listProducts({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        order: 'desc',
      });

      expect(productRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' }),
      );
    });

    it('returns a paginated shape with items and meta', async () => {
      productRepository.findMany.mockResolvedValue({
        items: [{ id: 1 }],
        total: 1,
      });

      const result = await service.listProducts({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        order: 'desc',
      });

      expect(result).toEqual({
        items: [{ id: 1 }],
        meta: { page: 1, limit: 20, total: 1 },
      });
    });
  });

  describe('getProductBySlug', () => {
    it('throws PRODUCT_001 when the product does not exist', async () => {
      productRepository.findBySlug.mockResolvedValue(null);

      await expect(service.getProductBySlug('missing')).rejects.toMatchObject({
        response: { code: 'PRODUCT_001' },
      });
    });

    it('returns the product when found', async () => {
      productRepository.findBySlug.mockResolvedValue({ id: 1, slug: 'found' });

      const result = await service.getProductBySlug('found');

      expect(result).toEqual({ id: 1, slug: 'found' });
    });
  });

  describe('createProduct', () => {
    it('throws COMMON_404 when the caller has no shop', async () => {
      shopPort.findByOwnerId.mockResolvedValue(null);

      await expect(
        service.createProduct(ownerId, { name: 'Áo thun', categoryId: 1 }),
      ).rejects.toMatchObject({ response: { code: 'COMMON_404' } });
    });

    it('creates the product under the caller shop with a unique slug', async () => {
      shopPort.findByOwnerId.mockResolvedValue({ id: 5 });
      productRepository.findBySlug
        .mockResolvedValueOnce({ id: 99 }) // "ao-thun" taken
        .mockResolvedValueOnce(null); // "ao-thun-2" free
      productRepository.create.mockResolvedValue({ id: 11, slug: 'ao-thun-2' });

      const result = await service.createProduct(ownerId, {
        name: 'Áo thun',
        categoryId: 1,
      });

      expect(productRepository.create).toHaveBeenCalledWith({
        shopId: 5,
        categoryId: 1,
        name: 'Áo thun',
        slug: 'ao-thun-2',
      });
      expect(result).toEqual({ id: 11, slug: 'ao-thun-2' });
    });
  });

  describe('updateProduct', () => {
    it('throws PRODUCT_001 when the product does not exist', async () => {
      productRepository.findByIdWithOwner.mockResolvedValue(null);

      await expect(
        service.updateProduct(ownerId, 10, { name: 'New name' }),
      ).rejects.toMatchObject({ response: { code: 'PRODUCT_001' } });
    });

    it('throws AUTH_003 when the caller does not own the product', async () => {
      productRepository.findByIdWithOwner.mockResolvedValue(baseProduct);

      await expect(
        service.updateProduct(otherOwnerId, 10, { name: 'New name' }),
      ).rejects.toMatchObject({ response: { code: 'AUTH_003' } });
    });

    it('updates the product when the caller is the owner', async () => {
      productRepository.findByIdWithOwner.mockResolvedValue(baseProduct);
      productRepository.update.mockResolvedValue({ id: 10, name: 'New name' });

      const result = await service.updateProduct(ownerId, 10, {
        name: 'New name',
      });

      expect(productRepository.update).toHaveBeenCalledWith(10, {
        name: 'New name',
      });
      expect(result).toEqual({ id: 10, name: 'New name' });
    });
  });

  describe('deactivateProduct', () => {
    it('throws AUTH_003 when the caller does not own the product', async () => {
      productRepository.findByIdWithOwner.mockResolvedValue(baseProduct);

      await expect(
        service.deactivateProduct(otherOwnerId, 10),
      ).rejects.toMatchObject({
        response: { code: 'AUTH_003' },
      });
    });

    it('deactivates the product when the caller is the owner', async () => {
      productRepository.findByIdWithOwner.mockResolvedValue(baseProduct);
      productRepository.deactivate.mockResolvedValue({
        id: 10,
        status: 'inactive',
      });

      const result = await service.deactivateProduct(ownerId, 10);

      expect(productRepository.deactivate).toHaveBeenCalledWith(10);
      expect(result).toEqual({ id: 10, status: 'inactive' });
    });
  });

  describe('createVariant', () => {
    it('throws AUTH_003 when the caller does not own the product', async () => {
      productRepository.findByIdWithOwner.mockResolvedValue(baseProduct);

      await expect(
        service.createVariant(otherOwnerId, 10, {
          sku: 'SKU-1',
          attributes: { color: 'red' },
          price: 100000,
          stockQuantity: 5,
        }),
      ).rejects.toMatchObject({ response: { code: 'AUTH_003' } });
    });

    it('creates the variant when the caller is the owner', async () => {
      productRepository.findByIdWithOwner.mockResolvedValue(baseProduct);
      productRepository.createVariant.mockResolvedValue({
        id: 1,
        sku: 'SKU-1',
      });

      const result = await service.createVariant(ownerId, 10, {
        sku: 'SKU-1',
        attributes: { color: 'red' },
        price: 100000,
        stockQuantity: 5,
      });

      expect(productRepository.createVariant).toHaveBeenCalledWith({
        productId: 10,
        sku: 'SKU-1',
        attributes: { color: 'red' },
        price: 100000,
        stockQuantity: 5,
      });
      expect(result).toEqual({ id: 1, sku: 'SKU-1' });
    });
  });

  describe('updateVariant', () => {
    it('throws PRODUCT_001 when the variant does not exist', async () => {
      productRepository.findVariantWithOwner.mockResolvedValue(null);

      await expect(
        service.updateVariant(ownerId, 10, 1, { price: 50000 }),
      ).rejects.toMatchObject({ response: { code: 'PRODUCT_001' } });
    });

    it('throws PRODUCT_001 when the variant belongs to a different product', async () => {
      productRepository.findVariantWithOwner.mockResolvedValue({
        productId: 999,
        product: { shop: { ownerId } },
      });

      await expect(
        service.updateVariant(ownerId, 10, 1, { price: 50000 }),
      ).rejects.toMatchObject({ response: { code: 'PRODUCT_001' } });
    });

    it('throws AUTH_003 when the caller does not own the product', async () => {
      productRepository.findVariantWithOwner.mockResolvedValue({
        productId: 10,
        product: { shop: { ownerId } },
      });

      await expect(
        service.updateVariant(otherOwnerId, 10, 1, { price: 50000 }),
      ).rejects.toMatchObject({ response: { code: 'AUTH_003' } });
    });

    it('updates the variant when the caller is the owner', async () => {
      productRepository.findVariantWithOwner.mockResolvedValue({
        productId: 10,
        product: { shop: { ownerId } },
      });
      productRepository.updateVariant.mockResolvedValue({
        id: 1,
        price: 50000,
      });

      const result = await service.updateVariant(ownerId, 10, 1, {
        price: 50000,
      });

      expect(productRepository.updateVariant).toHaveBeenCalledWith(1, {
        price: 50000,
      });
      expect(result).toEqual({ id: 1, price: 50000 });
    });
  });
});
