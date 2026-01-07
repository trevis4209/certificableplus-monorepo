// Debug utility for backend API testing
// Use this to verify products and maintenances exist before creating new ones

import { backendAPI } from '@/lib/api/backend';

/**
 * Verify if a product exists by UUID
 * @param productUuid - The product UUID to check
 * @returns True if product exists, false otherwise
 */
export async function verifyProductExists(productUuid: string): Promise<boolean> {
  try {
    console.log(`🔍 [DEBUG] Checking if product ${productUuid} exists...`);

    const products = await backendAPI.getAllProducts();
    const product = products.find(p => p.uuid === productUuid);

    if (product) {
      console.log('✅ [DEBUG] Product found:', {
        uuid: product.uuid,
        qr_code: product.qr_code,
        signal_type: product.signal_type,
        created_at: product.created_at
      });
      return true;
    } else {
      console.warn('⚠️ [DEBUG] Product NOT found in database!');
      console.log('📋 [DEBUG] Available products:', products.length);
      return false;
    }
  } catch (error: any) {
    console.error('❌ [DEBUG] Error checking product:', error.message);
    return false;
  }
}

/**
 * Check if a product already has an installation
 * @param productUuid - The product UUID to check
 * @returns True if installation exists, false otherwise
 */
export async function checkExistingInstallation(productUuid: string): Promise<boolean> {
  try {
    console.log(`🔍 [DEBUG] Checking for existing installations on product ${productUuid}...`);

    const maintenances = await backendAPI.getAllMaintenances();

    // Note: Backend GET /maintenance doesn't return product_uuid (known issue)
    // This is a limitation we need to work around
    console.warn('⚠️ [DEBUG] Backend GET /maintenance does not return product_uuid');
    console.log('📋 [DEBUG] Total maintenances in database:', maintenances.length);

    // Log all installations
    const installations = maintenances.filter(m => m.intervention_type === 'installation');
    console.log(`📊 [DEBUG] Total installations found: ${installations.length}`);

    if (installations.length > 0) {
      console.log('📋 [DEBUG] Recent installations:', installations.slice(0, 3).map(i => ({
        uuid: i.uuid,
        intervention_type: i.intervention_type,
        certificate_number: i.certificate_number,
        created_at: i.created_at
      })));
    }

    return false; // Can't determine due to missing product_uuid in response
  } catch (error: any) {
    console.error('❌ [DEBUG] Error checking installations:', error.message);
    return false;
  }
}

/**
 * Get detailed product info including maintenances
 * @param productUuid - The product UUID to check
 */
export async function getProductDetails(productUuid: string): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 PRODUCT DEBUG REPORT`);
  console.log(`${'='.repeat(60)}\n`);

  console.log(`Product UUID: ${productUuid}\n`);

  // Check if product exists
  console.log('1️⃣ Checking product existence...');
  const exists = await verifyProductExists(productUuid);

  if (!exists) {
    console.log('\n❌ ISSUE: Product does not exist in database!');
    console.log('💡 SOLUTION: Create the product first before adding maintenance');
    return;
  }

  // Check for existing installations
  console.log('\n2️⃣ Checking existing installations...');
  await checkExistingInstallation(productUuid);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`END REPORT`);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Test maintenance creation with detailed logging
 * @param productUuid - The product UUID to use
 */
export async function testMaintenanceCreation(productUuid: string): Promise<void> {
  console.log('\n🧪 TESTING MAINTENANCE CREATION');
  console.log(`${'='.repeat(60)}\n`);

  // First verify product exists
  const exists = await verifyProductExists(productUuid);
  if (!exists) {
    console.error('❌ Cannot test: Product does not exist');
    return;
  }

  console.log('\n✅ Product exists, proceeding with test...\n');
  console.log('💡 TIP: Watch the console for detailed field validation logs');
  console.log('💡 TIP: If you get 500 error, check backend logs for:');
  console.log('   - Algorand blockchain connection issues');
  console.log('   - IPFS upload failures');
  console.log('   - Database constraint violations');
  console.log('   - Duplicate installation attempts\n');
}
