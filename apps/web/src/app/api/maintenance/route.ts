/**
 * Maintenance API Route - Manage maintenance records with external API proxy
 *
 * **Core Features:**
 * - GET: Proxy to external API (https://api-dev.geosign.toknox.com/maintenance)
 * - POST: Create new maintenance record with product linking and blockchain integration
 * - Automatic data mapping from external API schema to internal schema
 * - ✅ **Response Format**: Matches endpoint.md structure with `payload: { data }` wrapper
 *
 * **Field Mapping (External API ↔ Internal Schema):**
 * - intervention_type → tipo_intervento (installation/maintenance/verification/dismissal/replacement)
 * - gps_lat/gps_lng → String format with 6 decimal precision
 * - year → anno (integer, optional with current year fallback)
 * - poles_number → tipologia_installazione (integer, optional)
 * - company_id → companyId
 * - certificate_number → certificato_numero
 * - reason → causale
 * - notes → note
 * - product_uuid → productId (linking to product)
 *
 * **Blockchain Integration:**
 * - Creates Algorand asset for each maintenance record
 * - Updates product's metadata CID with new maintenance
 * - Returns asset_id, metadata_cid, transaction_id
 *
 * **Technical Architecture:**
 * - Next.js 15 App Router API routes
 * - External API proxy for GET/POST requests (server-side)
 * - TypeScript with full type safety
 * - Error handling with proper HTTP status codes
 * - JSON response format with success/error states
 * - Automatic data mapping with fallback for missing product_uuid (see api-mapping.ts)
 *
 * **⚠️ Known Limitation:**
 * - External API GET /maintenance does NOT include `product_uuid` in response
 * - Frontend uses fallback matching via products.maintenances nested array
 * - If matching fails, product details may show "N/A" in UI
 * - **Long-term fix**: Backend team should add `product_uuid` to maintenance response
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, getApiHeaders } from '@/lib/api-config';
import { Maintenance } from '@certplus/types';
import {
  mapApiMaintenancesToMaintenances,
  type ApiMaintenanceResponse
} from '@/lib/api-mapping';

// GET /api/maintenance - Fetch maintenance records from external API
export async function GET() {
  try {
    console.log('[Proxy] Fetching maintenance from external API...');

    // Call external API from server-side
    const externalUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MAINTENANCE.GET_ALL}`;
    console.log('[Proxy] External URL:', externalUrl);

    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: getApiHeaders(),
      cache: 'no-store' // Disable cache for development
    });

    console.log('[Proxy] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Proxy] External API error:', errorText);
      throw new Error(`External API error: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('[Proxy] Raw response (first 500 chars):', responseText.substring(0, 500));

    let data: ApiMaintenanceResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Proxy] JSON parse error:', parseError);
      throw new Error('Failed to parse API response as JSON');
    }

    console.log('[Proxy] Parsed data:', JSON.stringify(data, null, 2));
    console.log('[Proxy] Maintenance count:', data.payload?.data?.length || 0);

    if (data.status_code === 200 && data.payload?.data) {
      const mappedMaintenance = mapApiMaintenancesToMaintenances(data.payload.data);
      console.log('[Proxy] Mapped maintenance count:', mappedMaintenance.length);

      return NextResponse.json({
        success: true,
        payload: {
          data: mappedMaintenance
        },
        total: mappedMaintenance.length,
        message: 'Maintenance records retrieved successfully'
      });
    } else {
      console.error('[Proxy] Unexpected API response structure:', data);
      throw new Error(data.message || 'Failed to fetch maintenance - unexpected response structure');
    }

  } catch (error) {
    console.error('[Proxy] Unhandled error:', error);
    console.error('[Proxy] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        success: false,
        payload: {
          data: []
        },
        error: 'Failed to fetch maintenance records',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function per mappare intervention_type API → UI
function reverseMapInterventionType(apiType: string): Maintenance['tipo_intervento'] {
  const map: Record<string, Maintenance['tipo_intervento']> = {
    'installation': 'installazione',
    'maintenance': 'manutenzione',
    'replacement': 'sostituzione',
    'verification': 'verifica',
    'dismissal': 'dismissione'
  };
  return map[apiType.toLowerCase()] || 'manutenzione';
}

// POST /api/maintenance - Create new maintenance record with blockchain integration
// No authentication required (using hardcoded values for development)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Hardcoded values for development (no auth system)
    const HARDCODED_COMPANY_ID = "1";
    const HARDCODED_USER_ID = "1";

    // Validate required fields (allineati con endpoint.md)
    const requiredFields = ['intervention_type', 'gps_lat', 'gps_lng', 'company_id',
                            'certificate_number', 'reason', 'notes', 'product_uuid'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
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

    console.log('[Proxy] Creating maintenance record...');

    // Map form data → API request body (allineato con endpoint.md)
    const apiRequestBody = {
      intervention_type: body.intervention_type,
      gps_lat: String(parseFloat(body.gps_lat).toFixed(6)), // String format per API
      gps_lng: String(parseFloat(body.gps_lng).toFixed(6)), // String format per API
      year: body.year ? parseInt(body.year) : new Date().getFullYear(), // Integer (optional)
      poles_number: body.poles_number ? parseInt(body.poles_number) : undefined, // Integer (optional)
      company_id: body.company_id || HARDCODED_COMPANY_ID,
      certificate_number: body.certificate_number,
      reason: body.reason,
      notes: body.notes,
      product_uuid: body.product_uuid
    };

    console.log('[Proxy] API request body:', JSON.stringify(apiRequestBody, null, 2));

    // Call external API
    const externalUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MAINTENANCE.CREATE}`;
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

      // Handle duplicate SHA-256 error (come per products)
      if (response.status === 400 && errorText.includes('SHA-256')) {
        return NextResponse.json({
          success: false,
          error: 'Manutenzione duplicata',
          message: 'Una manutenzione identica esiste già nel sistema (SHA-256 duplicato)',
          details: errorText
        }, { status: 400 });
      }

      throw new Error(`Failed to create maintenance: ${response.status} ${response.statusText} - ${errorText}`);
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

    console.log('[Proxy] Maintenance created:', JSON.stringify(apiResponse, null, 2));

    // Map API response → internal Maintenance format
    const createdMaintenance: Maintenance = {
      id: apiResponse.payload.uuid,
      product_uuid: body.product_uuid,
      productId: body.product_uuid, // Legacy compatibility

      // API fields
      intervention_type: apiResponse.payload.intervention_type,
      year: body.year,
      poles_number: body.poles_number,
      company_id: body.company_id || HARDCODED_COMPANY_ID,
      certificate_number: body.certificate_number,
      reason: body.reason,
      notes: body.notes,
      gps_lat: body.gps_lat,
      gps_lng: body.gps_lng,

      // UI fields (italiano) - reverse mapping
      tipo_intervento: reverseMapInterventionType(apiResponse.payload.intervention_type),
      anno: body.year,
      causale: body.reason,
      certificato_numero: body.certificate_number,
      note: body.notes,
      companyId: body.company_id || HARDCODED_COMPANY_ID,
      tipologia_installazione: body.poles_number ? `${body.poles_number}-pali` : undefined,

      // Blockchain metadata
      asset_id: apiResponse.payload.asset_id,
      metadata_cid: apiResponse.payload.metadata_cid,
      transaction_id: apiResponse.payload.transaction_id,

      // Legacy fields (not provided by API)
      foto_urls: [], // File uploads handled separately
      userId: HARDCODED_USER_ID,
      createdAt: new Date().toISOString()
    };

    console.log('[Proxy] Mapped maintenance:', {
      id: createdMaintenance.id,
      product_uuid: createdMaintenance.product_uuid,
      asset_id: createdMaintenance.asset_id,
      metadata_cid: createdMaintenance.metadata_cid,
      transaction_id: createdMaintenance.transaction_id
    });

    return NextResponse.json({
      success: true,
      data: createdMaintenance,
      message: 'Maintenance record created successfully and recorded on blockchain'
    });

  } catch (error) {
    console.error('POST /api/maintenance error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create maintenance record',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
