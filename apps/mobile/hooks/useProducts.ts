// Custom hook for managing product data from backend API
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@certplus/types';
import { backendAPI } from '@/lib/api/backend';
import {
  mapProductDataToProduct,
  mapProductToCreateRequest,
  mapProductCreateResponseToProduct
} from '@/lib/api/mappers';
import type { ProductCreateRequest } from '@/types/product';

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createProduct: (product: Partial<Product>, userId: string) => Promise<Product>;
}

interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage all products from the backend
 * @param companyId - Company ID for filtering products (required for mapping)
 * @returns products array, loading state, error, and refetch function
 */
export function useProducts(companyId: string = 'default-company'): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await backendAPI.getAllProducts();

      // Map backend data to frontend Product type
      const mapped = data.map(productData =>
        mapProductDataToProduct(productData, companyId)
      );

      setProducts(mapped);
      console.log(`✅ Fetched ${mapped.length} products from backend`);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('❌ Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = useCallback(async (
    product: Partial<Product>,
    userId: string
  ): Promise<Product> => {
    try {
      // Map frontend Product to backend request format
      const request: ProductCreateRequest = mapProductToCreateRequest(product, userId);

      // Create product via API
      const response = await backendAPI.createProduct(request);

      // Map response to Product and add to local state
      const newProduct = mapProductCreateResponseToProduct(response, request, companyId);

      setProducts(prev => [...prev, newProduct as Product]);
      console.log('✅ Product created successfully:', response.uuid);

      return newProduct as Product;
    } catch (err) {
      console.error('❌ Failed to create product:', err);
      throw err;
    }
  }, [companyId]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
  };
}

/**
 * Hook to fetch a single product by ID
 * @param productId - Product UUID to fetch
 * @param companyId - Company ID for mapping
 * @returns product object, loading state, error, and refetch function
 */
export function useProduct(
  productId: string | null,
  companyId: string = 'default-company'
): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all products and find the one we need
      // Backend doesn't have a single product endpoint yet
      const data = await backendAPI.getAllProducts();
      const productData = data.find(p => p.uuid === productId);

      if (productData) {
        const mapped = mapProductDataToProduct(productData, companyId);
        setProduct(mapped);
        console.log('✅ Fetched product:', productId);
      } else {
        throw new Error(`Product not found: ${productId}`);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('❌ Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, companyId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
}

/**
 * Hook to get products with GPS coordinates (for map view)
 * @param companyId - Company ID for filtering
 * @returns products with valid GPS coordinates
 */
export function useProductsWithLocation(companyId: string = 'default-company') {
  const { products, loading, error, refetch } = useProducts(companyId);

  // Filter products that have valid GPS coordinates
  const productsWithLocation = products.filter(p =>
    p.gps_lat !== undefined &&
    p.gps_lng !== undefined &&
    !isNaN(p.gps_lat) &&
    !isNaN(p.gps_lng)
  );

  return {
    products: productsWithLocation,
    loading,
    error,
    refetch,
  };
}
