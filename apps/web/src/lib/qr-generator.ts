/**
 * QR Code Generator Utility - Enterprise-grade QR generation with base64 output
 *
 * **Core Features:**
 * - Unique QR code ID generation with collision avoidance
 * - Canvas-based base64 image generation for backend storage
 * - Configurable QR code styling and error correction
 * - TypeScript interfaces for type safety
 *
 * **QR Code Generation Strategy:**
 * - Timestamp-based unique IDs (QR{timestamp})
 * - URL format: /public/product/{qr_code} for public access
 * - PNG format base64 output optimized for storage
 * - Error handling with detailed logging
 *
 * **Technical Architecture:**
 * - Uses qrcode library for core QR generation
 * - Canvas API for image conversion and styling
 * - Async/await pattern for performance
 * - Environment-aware URL generation
 *
 * **Integration Points:**
 * - API routes (/api/products)
 * - Product creation flow
 * - Mock data system
 * - QRCodeModal component for display
 */

import QRCode from 'qrcode';
import { mockProducts } from './mock-data';

/**
 * QR Code generation options interface
 */
export interface QRCodeOptions {
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * QR Code generation result interface
 */
export interface QRCodeResult {
  qr_code: string;
  qr_url: string;
  qr_image_base64: string;
  created_at: string;
}

/**
 * Default QR code generation options
 */
const DEFAULT_QR_OPTIONS: Required<QRCodeOptions> = {
  width: 400,
  height: 400,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'M'
};

/**
 * Generate a unique QR code identifier
 * Uses timestamp-based generation to ensure uniqueness
 * Format: QR{timestamp} (e.g., QR1703123456789)
 *
 * @returns Unique QR code string
 */
export function generateUniqueQRCode(): string {
  const timestamp = Date.now();
  const qrCode = `QR${timestamp}`;

  // Double-check uniqueness against existing products
  const exists = mockProducts.some(product => product.qr_code === qrCode);

  if (exists) {
    // If by some miracle the timestamp collides, add a random suffix
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `QR${timestamp}${randomSuffix}`;
  }

  return qrCode;
}

/**
 * Generate QR code as base64 image string
 * Creates a PNG image encoded in base64 format for backend storage
 *
 * @param data - Data to encode in QR code (usually a URL)
 * @param options - Optional QR code styling options
 * @returns Promise<string> - Base64 encoded PNG image (data:image/png;base64,...)
 */
export async function generateQRCodeBase64(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };

    // Generate QR code as data URL (base64)
    const qrDataURL = await QRCode.toDataURL(data, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
      type: 'image/png'
    });

    return qrDataURL;

  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code as raw base64 string (without data:image/png;base64, prefix)
 * Useful when you only need the base64 data without the data URL prefix
 *
 * @param data - Data to encode in QR code
 * @param options - Optional QR code styling options
 * @returns Promise<string> - Raw base64 encoded image data
 */
export async function generateQRCodeBase64Raw(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const dataURL = await generateQRCodeBase64(data, options);

  // Extract base64 data after the comma
  const base64Data = dataURL.split(',')[1];
  if (!base64Data) {
    throw new Error('Failed to extract base64 data from QR code');
  }

  return base64Data;
}

/**
 * Generate QR code as Buffer for server-side operations
 * Useful for saving QR codes directly to file system or cloud storage
 *
 * @param data - Data to encode in QR code
 * @param options - Optional QR code styling options
 * @returns Promise<Buffer> - PNG image buffer
 */
export async function generateQRCodeBuffer(
  data: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  try {
    const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };

    const buffer = await QRCode.toBuffer(data, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
      type: 'png'
    });

    return buffer;

  } catch (error) {
    console.error('QR Code buffer generation failed:', error);
    throw new Error(`Failed to generate QR code buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create complete QR code data for a product
 * Generates QR code ID, URL, and base64 image in one operation
 *
 * @param productData - Basic product information for URL generation
 * @param baseUrl - Base URL for the application (optional, uses env var)
 * @param options - Optional QR code styling options
 * @returns Promise<QRCodeResult> - Complete QR code data
 */
export async function createProductQRCode(
  productData: {
    companyId: string;
    tipologia_segnale?: string;
  },
  baseUrl?: string,
  options: QRCodeOptions = {}
): Promise<QRCodeResult> {
  try {
    // Generate unique QR code ID
    const qrCode = generateUniqueQRCode();

    // Create public URL for the QR code
    const appBaseUrl = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrUrl = `${appBaseUrl}/public/product/${qrCode}`;

    // Generate QR code image as base64
    const qrImageBase64 = await generateQRCodeBase64(qrUrl, options);

    return {
      qr_code: qrCode,
      qr_url: qrUrl,
      qr_image_base64: qrImageBase64,
      created_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Complete QR code creation failed:', error);
    throw new Error(`Failed to create product QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate QR code format
 * Checks if a string matches the expected QR code format
 *
 * @param qrCode - QR code string to validate
 * @returns boolean - True if valid format
 */
export function isValidQRCodeFormat(qrCode: string): boolean {
  // QR code format: QR followed by timestamp (at least 13 digits)
  const qrCodePattern = /^QR\d{13,}$/;
  return qrCodePattern.test(qrCode);
}

/**
 * Extract timestamp from QR code
 * Gets the creation timestamp from a QR code ID
 *
 * @param qrCode - QR code string
 * @returns number | null - Unix timestamp or null if invalid format
 */
export function extractQRCodeTimestamp(qrCode: string): number | null {
  if (!isValidQRCodeFormat(qrCode)) {
    return null;
  }

  const timestampStr = qrCode.replace('QR', '');
  const timestamp = parseInt(timestampStr, 10);

  return isNaN(timestamp) ? null : timestamp;
}

/**
 * Generate QR code for existing product (migration utility)
 * Useful for migrating existing products to include QR codes
 *
 * @param productId - Existing product ID
 * @param baseUrl - Base URL for the application
 * @param options - Optional QR code styling options
 * @returns Promise<QRCodeResult> - QR code data for existing product
 */
export async function generateQRCodeForExistingProduct(
  productId: string,
  baseUrl?: string,
  options: QRCodeOptions = {}
): Promise<QRCodeResult> {
  try {
    const qrCode = generateUniqueQRCode();
    const appBaseUrl = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrUrl = `${appBaseUrl}/public/product/${qrCode}`;

    const qrImageBase64 = await generateQRCodeBase64(qrUrl, options);

    return {
      qr_code: qrCode,
      qr_url: qrUrl,
      qr_image_base64: qrImageBase64,
      created_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('QR code generation for existing product failed:', error);
    throw new Error(`Failed to generate QR code for product ${productId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Batch generate QR codes for multiple products
 * Useful for migrating multiple products or bulk operations
 *
 * @param productIds - Array of product IDs
 * @param baseUrl - Base URL for the application
 * @param options - Optional QR code styling options
 * @returns Promise<QRCodeResult[]> - Array of QR code data
 */
export async function batchGenerateQRCodes(
  productIds: string[],
  baseUrl?: string,
  options: QRCodeOptions = {}
): Promise<QRCodeResult[]> {
  const results: QRCodeResult[] = [];

  for (const productId of productIds) {
    try {
      const qrResult = await generateQRCodeForExistingProduct(productId, baseUrl, options);
      results.push(qrResult);
    } catch (error) {
      console.error(`Failed to generate QR code for product ${productId}:`, error);
      // Continue with other products even if one fails
    }
  }

  return results;
}