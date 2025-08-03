
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type GetProductsInput, type Product } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getProducts = async (input: GetProductsInput): Promise<Product[]> => {
  try {
    // Build the query step by step without reassigning
    const baseQuery = db.select().from(productsTable);
    
    // Apply filters and build final query
    const finalQuery = input.status 
      ? baseQuery.where(eq(productsTable.status, input.status))
        .orderBy(desc(productsTable.created_at))
        .limit(input.limit)
        .offset(input.offset)
      : baseQuery.orderBy(desc(productsTable.created_at))
        .limit(input.limit)
        .offset(input.offset);

    const results = await finalQuery.execute();

    // Convert numeric fields back to numbers
    return results.map(product => ({
      ...product,
      price: parseFloat(product.price)
    }));
  } catch (error) {
    console.error('Get products failed:', error);
    throw error;
  }
};
