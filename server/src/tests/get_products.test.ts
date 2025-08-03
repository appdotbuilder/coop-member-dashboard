
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type GetProductsInput } from '../schema';
import { getProducts } from '../handlers/get_products';

describe('getProducts', () => {
  beforeEach(async () => {
    await createDB();
    
    // Insert test data one by one to ensure different timestamps
    await db.insert(productsTable).values({
      name: 'TV LED 55"',
      price: '5999000',
      status: 'promo' as const,
      image_url: null,
      description: 'Smart TV LED 55 inch dengan resolusi 4K'
    }).execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(productsTable).values({
      name: 'Kulkas 2 Pintu',
      price: '6750000',
      status: 'baru' as const,
      image_url: null,
      description: 'Kulkas 2 pintu dengan freezer besar'
    }).execute();

    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(productsTable).values({
      name: 'Sofa 3 Dudukan',
      price: '4500000',
      status: 'promo' as const,
      image_url: null,
      description: 'Sofa nyaman untuk ruang tamu'
    }).execute();

    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(productsTable).values({
      name: 'Mesin Cuci 8kg',
      price: '3200000',
      status: 'regular' as const,
      image_url: null,
      description: 'Mesin cuci otomatis kapasitas 8kg'
    }).execute();
  });

  afterEach(resetDB);

  it('should get all products with default pagination', async () => {
    const input: GetProductsInput = {
      limit: 10,
      offset: 0
    };

    const result = await getProducts(input);

    expect(result).toHaveLength(4);
    expect(result[0].name).toEqual('Mesin Cuci 8kg'); // Most recent first (desc order)
    expect(result[0].price).toEqual(3200000);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].status).toEqual('regular');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should filter products by status', async () => {
    const input: GetProductsInput = {
      limit: 10,
      offset: 0,
      status: 'promo'
    };

    const result = await getProducts(input);

    expect(result).toHaveLength(2);
    result.forEach(product => {
      expect(product.status).toEqual('promo');
      expect(typeof product.price).toBe('number');
    });
    
    // Most recent promo product should be first
    expect(result[0].name).toEqual('Sofa 3 Dudukan');
  });

  it('should handle pagination correctly', async () => {
    const input: GetProductsInput = {
      limit: 2,
      offset: 1
    };

    const result = await getProducts(input);

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('Sofa 3 Dudukan'); // Second item (offset 1)
    expect(typeof result[0].price).toBe('number');
  });

  it('should return single product when status filter matches one product', async () => {
    const input: GetProductsInput = {
      limit: 10,
      offset: 0,
      status: 'baru'
    };

    const result = await getProducts(input);

    expect(result).toHaveLength(1);
    expect(result[0].status).toEqual('baru');
    expect(result[0].name).toEqual('Kulkas 2 Pintu');
    expect(typeof result[0].price).toBe('number');
  });

  it('should handle offset beyond available products', async () => {
    const input: GetProductsInput = {
      limit: 10,
      offset: 10
    };

    const result = await getProducts(input);

    expect(result).toHaveLength(0);
  });

  it('should return products ordered by creation date descending', async () => {
    const input: GetProductsInput = {
      limit: 10,
      offset: 0
    };

    const result = await getProducts(input);

    expect(result).toHaveLength(4);
    
    // Verify order - most recent first
    expect(result[0].name).toEqual('Mesin Cuci 8kg');
    expect(result[1].name).toEqual('Sofa 3 Dudukan');
    expect(result[2].name).toEqual('Kulkas 2 Pintu');
    expect(result[3].name).toEqual('TV LED 55"');
    
    // Verify timestamps are in descending order
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].created_at >= result[i + 1].created_at).toBe(true);
    }
  });
});
