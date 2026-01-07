// Hook per gestire i dati del backend
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Product, Maintenance } from '@certplus/types';
import { backendAPI } from '@/lib/api/backend';
import {
  mapProductDataToProduct,
  mapProductToCreateRequest,
  mapProductCreateResponseToProduct,
  mapMaintenanceToCreateRequest,
  mapMaintenanceCreateResponseToMaintenance,
  mapMaintenanceDataToMaintenance,
} from '@/lib/api/mappers';
import { useAuth } from '@/contexts/AuthContext';
import { extractQRCode } from '@certplus/utils';

export const useBackendData = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all products from backend
  const loadProducts = useCallback(async () => {
    if (!user?.companyId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await backendAPI.getAllProducts();
      const mappedProducts = data.map(p =>
        mapProductDataToProduct(p, user.companyId!)
      );
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Errore nel caricamento dei prodotti');
    } finally {
      setIsLoading(false);
    }
  }, [user?.companyId]);

  // Load all maintenances from backend
  const loadMaintenances = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await backendAPI.getAllMaintenances();
      // Map maintenances to frontend format
      const mappedMaintenances = data.map(m =>
        mapMaintenanceDataToMaintenance(m, '', user?.id || '')
      );
      setMaintenances(mappedMaintenances);
    } catch (error) {
      console.error('Error loading maintenances:', error);
      setError('Errore nel caricamento delle manutenzioni');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Create a new product
  const createProduct = useCallback(async (productData: Partial<Product>) => {
    if (!user?.id || !user?.companyId) {
      Alert.alert('Errore', 'Utente non autenticato');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Prepare request
      const request = mapProductToCreateRequest(productData, user.id);

      // Call backend
      const response = await backendAPI.createProduct(request);

      // Map response to product
      const newProduct = mapProductCreateResponseToProduct(
        response,
        request,
        user.companyId
      );

      // Update local state
      if (newProduct.id) {
        setProducts(prev => [...prev, newProduct as Product]);
      }

      Alert.alert('Successo', 'Prodotto creato correttamente');
      return newProduct;
    } catch (error: any) {
      console.error('Error creating product:', error);
      const message = error.message || 'Errore nella creazione del prodotto';
      Alert.alert('Errore', message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.companyId]);

  // Create a new maintenance
  const createMaintenance = useCallback(async (
    maintenanceData: Partial<Maintenance>,
    productUuid: string,
    certificateNumber?: string
  ) => {
    if (!user?.id || !user?.companyId) {
      Alert.alert('Errore', 'Utente non autenticato');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validate GPS coordinates if provided
      if (maintenanceData.gps_lat && maintenanceData.gps_lng) {
        const isValid = backendAPI.validateGPSCoordinates(
          maintenanceData.gps_lat,
          maintenanceData.gps_lng
        );
        if (!isValid) {
          Alert.alert('Errore', 'Coordinate GPS non valide');
          return null;
        }
      }

      // Prepare request
      const request = mapMaintenanceToCreateRequest(
        maintenanceData,
        productUuid,
        user.companyId,
        certificateNumber
      );

      // Call backend
      const response = await backendAPI.createMaintenance(request);

      // Map response to maintenance
      const newMaintenance = mapMaintenanceCreateResponseToMaintenance(
        response,
        request,
        user.id
      );

      // Update local state
      if (newMaintenance.id) {
        setMaintenances(prev => [...prev, newMaintenance as Maintenance]);
      }

      Alert.alert('Successo', 'Intervento registrato correttamente');
      return newMaintenance;
    } catch (error: any) {
      console.error('Error creating maintenance:', error);
      const message = error.message || 'Errore nella registrazione dell\'intervento';
      Alert.alert('Errore', message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.companyId]);

  // Find product by QR code (supports both URL and direct code formats)
  const findProductByQRCode = useCallback((qrCode: string): Product | null => {
    if (!qrCode) return null;

    // Extract the code from URL if necessary
    const extractedCode = extractQRCode(qrCode);

    // Try to find product by matching either:
    // 1. Extracted code matches product qr_code
    // 2. Original qrCode matches product qr_code (backward compatibility)
    return products.find(p =>
      p.qr_code === extractedCode || p.qr_code === qrCode
    ) || null;
  }, [products]);

  // Get maintenances for a product
  const getMaintenancesByProductId = useCallback((productId: string): Maintenance[] => {
    return maintenances.filter(m => m.productId === productId);
  }, [maintenances]);

  // Check if product is installed
  const isProductInstalled = useCallback((productId: string): boolean => {
    const productMaintenances = getMaintenancesByProductId(productId);
    const hasInstallation = productMaintenances.some(m => m.tipo_intervento === 'installazione');
    const hasDismission = productMaintenances.some(m => m.tipo_intervento === 'dismissione');

    return hasInstallation && !hasDismission;
  }, [getMaintenancesByProductId]);

  // Load initial data
  useEffect(() => {
    if (user?.companyId) {
      loadProducts();
      loadMaintenances();
    }
  }, [user?.companyId]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await Promise.all([loadProducts(), loadMaintenances()]);
  }, [loadProducts, loadMaintenances]);

  return {
    // Data
    products,
    maintenances,
    isLoading,
    error,

    // Methods
    loadProducts,
    loadMaintenances,
    createProduct,
    createMaintenance,
    findProductByQRCode,
    getMaintenancesByProductId,
    isProductInstalled,
    refreshData,
  };
};