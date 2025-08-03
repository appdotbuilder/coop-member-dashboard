
import { type GetProductsInput, type Product } from '../schema';

export async function getProducts(input: GetProductsInput): Promise<Product[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch products with pagination and optional status filtering
    // Supports filtering by product status (promo, baru, regular)
    
    const mockProducts: Product[] = [
        {
            id: 1,
            name: "TV LED 55\"",
            price: 5999000,
            status: 'promo',
            image_url: null,
            description: "Smart TV LED 55 inch dengan resolusi 4K",
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: 2,
            name: "Kulkas 2 Pintu",
            price: 6750000,
            status: 'baru',
            image_url: null,
            description: "Kulkas 2 pintu dengan freezer besar",
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: 3,
            name: "Sofa 3 Dudukan",
            price: 4500000,
            status: 'promo',
            image_url: null,
            description: "Sofa nyaman untuk ruang tamu",
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: 4,
            name: "Mesin Cuci 8kg",
            price: 3200000,
            status: 'regular',
            image_url: null,
            description: "Mesin cuci otomatis kapasitas 8kg",
            created_at: new Date(),
            updated_at: new Date()
        }
    ];

    // Apply status filter if provided
    let filteredProducts = mockProducts;
    if (input.status) {
        filteredProducts = mockProducts.filter(product => product.status === input.status);
    }

    // Apply pagination
    const startIndex = input.offset || 0;
    const endIndex = startIndex + (input.limit || 10);
    
    return Promise.resolve(filteredProducts.slice(startIndex, endIndex));
}
