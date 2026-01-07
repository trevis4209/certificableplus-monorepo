/**
 * Products API Route - Create and manage products with QR code generation
 *
 * **Core Features:**
 * - GET: Proxy to external API (https://api-dev.geosign.toknox.com/product)
 * - POST: Create new product with automatic QR code generation
 * - PUT: Update existing product (preserves QR code)
 * - DELETE: Delete product
 * - Automatic data mapping from external API schema to internal schema
 *
 * **QR Code Integration:**
 * - Generates unique QR codes for each product (QR{timestamp} format)
 * - Creates QR code image as base64 for backend storage
 * - QR codes point to public product pages: /public/product/{qr_code}
 *
 * **Field Mapping (External API ↔ Internal Schema):**
 * - signal_type → tipologia_segnale (permanent/temporary)
 * - signal_category → tipo_segnale (descriptive category, optional with fallback)
 * - production_year → anno
 * - support_material → materiale_supporto
 * - support_thickness → spessore_supporto
 * - fixation_method → fissaggio
 * - dimension → dimensioni
 *
 * **Technical Architecture:**
 * - Next.js 15 App Router API routes
 * - External API proxy for GET requests (server-side)
 * - TypeScript with full type safety
 * - Error handling with proper HTTP status codes
 * - JSON response format with success/error states
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateQRCodeBase64, generateUniqueQRCode } from '@/lib/qr-generator';
import { Product } from '@certplus/types';
import { API_CONFIG, getApiHeaders } from '@/lib/api-config';
import { mapApiProductsToProducts, type ApiProductsResponse } from '@/lib/api-mapping';
import { requireRole } from '@/lib/auth-middleware';
import { mockProducts } from '@/lib/mock-data';

// GET /api/products - Proxy to external API
// Fetches products from external Geosign API and maps to internal schema
// Supports optional ?id={productId} query param for single product retrieval
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    console.log('[Proxy] Fetching products from external API...');
    if (productId) {
      console.log('[Proxy] Single product requested:', productId);
    }

    // Call external API from server-side
    const externalUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.GET_ALL}`;
    console.log('[Proxy] External URL:', externalUrl);
    console.log('[Proxy] API Key:', API_CONFIG.API_KEY ? 'Present' : 'Missing');

    const headers = getApiHeaders();
    console.log('[Proxy] Headers:', JSON.stringify(headers, null, 2));

    const response = await fetch(externalUrl, {
      method: 'GET',
      headers,
      // Disable cache for development - ensures fresh data after POST
      cache: 'no-store'
    });

    console.log('[Proxy] Response status:', response.status);
    console.log('[Proxy] Response headers:', JSON.stringify(Object.fromEntries(response.headers), null, 2));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Proxy] External API error response:', errorText);
      console.error('[Proxy] Status:', response.status, response.statusText);
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('[Proxy] Raw response (first 500 chars):', responseText.substring(0, 500));

    let data: ApiProductsResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Proxy] JSON parse error:', parseError);
      console.error('[Proxy] Response text:', responseText);
      throw new Error('Failed to parse API response as JSON');
    }

    console.log('[Proxy] Parsed data:', JSON.stringify(data, null, 2));
    console.log('[Proxy] Products count:', data.payload?.data?.length || 0);

    // Map external API response to internal format
    if (data.status_code === 200 && data.payload?.data) {
      const mappedProducts = mapApiProductsToProducts(data.payload.data);
      console.log('[Proxy] Mapped products count:', mappedProducts.length);

      // If specific product ID requested, filter and return single product
      if (productId) {
        const product = mappedProducts.find(p => p.id === productId);

        if (!product) {
          console.log('[Proxy] Product not found:', productId);
          return NextResponse.json(
            {
              success: false,
              error: 'Product not found',
              message: `Product with ID ${productId} not found`,
              data: null
            },
            { status: 404 }
          );
        }

        console.log('[Proxy] Found product:', product.id);
        return NextResponse.json({
          success: true,
          data: product, // Single product object
          message: 'Product retrieved successfully'
        });
      }

      // Return all products (existing behavior)
      return NextResponse.json({
        success: true,
        data: mappedProducts,
        total: mappedProducts.length,
        message: 'Products retrieved successfully'
      });
    } else {
      console.error('[Proxy] Unexpected API response structure:', data);
      throw new Error(data.message || 'Failed to fetch products - unexpected response structure');
    }

  } catch (error) {
    console.error('[Proxy] Unhandled error:', error);
    console.error('[Proxy] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
        data: [],
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product with QR code generation
// No authentication required (using hardcoded values for development)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Hardcoded values for development (no auth system)
    const HARDCODED_COMPANY_ID = "1";
    const HARDCODED_USER_ID = "1";

    // Validate required fields (English format from ProductModal)
    // Note: signal_category is optional - if not provided, falls back to signal_type
    const requiredFields = ['qr_code', 'signal_type', 'production_year', 'shape'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      console.error('[Proxy] Missing fields:', missingFields);
      console.error('[Proxy] Received body:', JSON.stringify(body, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          missingFields,
          message: `Required fields missing: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Generate unique QR code
    const qrCode = generateUniqueQRCode();
    const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/public/product/${qrCode}`;

    // Generate QR code image as base64
    const qrImageBase64 = await generateQRCodeBase64(qrUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log('[Proxy] Creating product with QR:', qrCode);

    // Map internal schema → external API schema
    const apiRequestBody = {
      qr_code: qrCode,
      signal_type: body.signal_type || '',
      signal_category: body.signal_category || '',
      production_year: parseInt(body.production_year),
      shape: body.shape,
      dimension: body.dimension || '',
      wl_code: body.wl_code || '',
      support_material: body.support_material || '',
      support_thickness: String(body.support_thickness || '0'),
      fixation_class: body.fixation_class || '',
      fixation_method: body.fixation_method || '',
      created_by: HARDCODED_USER_ID
    };

    console.log('[Proxy] API request body:', JSON.stringify(apiRequestBody, null, 2));

    // Call external API
    const externalUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.CREATE}`;
    console.log('[Proxy] External URL:', externalUrl);

    const response = await fetch(externalUrl, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(apiRequestBody)
    });

    console.log('[Proxy] Create response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Proxy] Create error:', errorText);

      // Handle duplicate SHA-256 error
      if (response.status === 400 && errorText.includes('SHA-256')) {
        return NextResponse.json({
          success: false,
          error: 'Prodotto duplicato',
          message: 'Un prodotto identico esiste già nel sistema (SHA-256 duplicato)',
          details: errorText
        }, { status: 400 });
      }

      throw new Error(`Failed to create product: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('[Proxy] Raw response:', responseText.substring(0, 500));

    let apiResponse: any;
    try {
      apiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Proxy] JSON parse error:', parseError);
      throw new Error('Failed to parse API response as JSON');
    }

    console.log('[Proxy] Product created:', JSON.stringify(apiResponse, null, 2));

    // Map API response → internal Product format (English from request → Italian for Product type)
    const createdProduct: Product = {
      id: apiResponse.payload.uuid,
      qr_code: qrCode,
      tipologia_segnale: body.signal_type || '', // signal_type: "permanent" or "temporary"
      tipo_segnale: body.signal_category || body.signal_type || '', // signal_category (descriptive) with fallback to signal_type
      anno: parseInt(body.production_year),
      forma: body.shape,
      dimensioni: body.dimension || '',
      materiale_supporto: body.support_material || '',
      spessore_supporto: parseFloat(body.support_thickness) || 0,
      wl: body.wl_code || '',
      materiale_pellicola: body.fixation_class || '',
      figura: body.figura || '',
      fissaggio: body.fixation_method || '',
      gps_lat: body.gps_lat ? parseFloat(body.gps_lat) : undefined,
      gps_lng: body.gps_lng ? parseFloat(body.gps_lng) : undefined,
      is_cantieristica_stradale: body.is_cantieristica_stradale || false,
      stato_prodotto: body.stato_prodotto,
      data_scadenza: body.data_scadenza,
      companyId: HARDCODED_COMPANY_ID,
      createdBy: HARDCODED_USER_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Blockchain metadata from API
      asset_id: apiResponse.payload.asset_id,
      metadata_cid: apiResponse.payload.metadata_cid
    };

    console.log('[Proxy] Mapped product:', {
      id: createdProduct.id,
      qr_code: createdProduct.qr_code,
      asset_id: createdProduct.asset_id,
      metadata_cid: createdProduct.metadata_cid
    });

    // Response with product data and QR code base64
    return NextResponse.json({
      success: true,
      data: {
        product: createdProduct,
        qr_image_base64: qrImageBase64,
        qr_url: qrUrl
      },
      message: 'Product created successfully and tokenized on blockchain'
    });

  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update existing product (preserves QR code)
// Requires authentication: Only company users can update products from their company
export async function PUT(request: NextRequest) {
  try {
    // Require company role
    const authResult = await requireRole(request, ['company']);

    if (!authResult.success) {
      return authResult.error;
    }

    const user = authResult.data;
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID required for update',
          message: 'Missing product ID in request body'
        },
        { status: 400 }
      );
    }

    // Find existing product
    const existingProduct = mockProducts.find(p => p.id === id);
    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: `Product with ID ${id} not found`
        },
        { status: 404 }
      );
    }

    // Verify user can only update their company's products
    if (existingProduct.companyId !== user.companyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          message: 'You can only update products from your company'
        },
        { status: 403 }
      );
    }

    // Update product (preserve QR code and creation data)
    const updatedProduct: Product = {
      ...existingProduct,
      ...updateData,
      id: existingProduct.id, // Preserve ID
      qr_code: existingProduct.qr_code, // Preserve QR code
      createdBy: existingProduct.createdBy, // Preserve creator
      createdAt: existingProduct.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(), // Update timestamp
    };

    // Update in mock data (in real implementation, this would update database)
    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      mockProducts[productIndex] = updatedProduct;
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('PUT /api/products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
// Requires authentication: Only company users can delete products from their company
export async function DELETE(request: NextRequest) {
  try {
    // Require company role
    const authResult = await requireRole(request, ['company']);

    if (!authResult.success) {
      return authResult.error;
    }

    const user = authResult.data;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID required',
          message: 'Missing product ID in query parameters'
        },
        { status: 400 }
      );
    }

    // Find product
    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: `Product with ID ${id} not found`
        },
        { status: 404 }
      );
    }

    const product = mockProducts[productIndex];

    // Verify user can only delete their company's products
    if (product.companyId !== user.companyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          message: 'You can only delete products from your company'
        },
        { status: 403 }
      );
    }

    // Remove from mock data
    const deletedProduct = mockProducts.splice(productIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedProduct,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}