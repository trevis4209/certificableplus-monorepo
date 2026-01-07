#!/bin/bash
# Test Product Endpoints
# Usage: ./scripts/test-product-endpoints.sh [API_URL] [JWT_TOKEN]

# Configuration
API_URL="${1:-http://localhost:3000}"
JWT_TOKEN="${2:-your-jwt-token-here}"

echo "=========================================="
echo "   Testing Product Endpoints"
echo "=========================================="
echo "API URL: $API_URL"
echo ""

# Test 1: Create Product
echo "📦 Test 1: Creating new product..."
echo "------------------------------------------"

TIMESTAMP=$(date +%s)
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/product/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "TEST-'$TIMESTAMP'",
    "signal_type": "Pericolo - Test Automatico",
    "production_year": 2024,
    "shape": "Triangolare",
    "dimension": "90x90cm",
    "wl_code": "WL-TEST-'$TIMESTAMP'",
    "support_material": "Alluminio spessore 25/10",
    "support_thickness": "2.5mm",
    "fixation_class": "Classe RA2",
    "fixation_method": "Palo sostegno diametro 60mm",
    "created_by": "test-user-id"
  }')

echo "$CREATE_RESPONSE" | jq '.'

# Extract and display key info
STATUS_CODE=$(echo "$CREATE_RESPONSE" | jq -r '.status_code')
PRODUCT_UUID=$(echo "$CREATE_RESPONSE" | jq -r '.payload.data.uuid')
ASSET_ID=$(echo "$CREATE_RESPONSE" | jq -r '.payload.data.asset_id')
METADATA_CID=$(echo "$CREATE_RESPONSE" | jq -r '.payload.data.metadata_cid')

if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ Product created successfully!"
    echo "   UUID: $PRODUCT_UUID"
    echo "   Asset ID: $ASSET_ID"
    echo "   Metadata CID: $METADATA_CID"
else
    echo "❌ Product creation failed!"
fi
echo ""

# Test 2: Get All Products
echo "📋 Test 2: Retrieving all products..."
echo "------------------------------------------"

GET_RESPONSE=$(curl -s -X GET "$API_URL/product" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "$GET_RESPONSE" | jq '.'

PRODUCTS_COUNT=$(echo "$GET_RESPONSE" | jq '.payload.data | length')
GET_STATUS=$(echo "$GET_RESPONSE" | jq -r '.status_code')

if [ "$GET_STATUS" = "200" ]; then
    echo "✅ Products retrieved successfully!"
    echo "   Total products: $PRODUCTS_COUNT"
else
    echo "❌ Failed to retrieve products!"
fi
echo ""

# Test 3: Create Duplicate (Should Fail)
echo "🔁 Test 3: Testing duplicate QR code (should fail)..."
echo "------------------------------------------"

DUPLICATE_RESPONSE=$(curl -s -X POST "$API_URL/product/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "TEST-'$TIMESTAMP'",
    "signal_type": "Duplicate Test",
    "production_year": 2024,
    "shape": "Triangolare",
    "dimension": "90x90cm",
    "support_material": "Alluminio",
    "support_thickness": "2.5mm",
    "fixation_class": "Classe RA2",
    "fixation_method": "Palo sostegno",
    "created_by": "test-user-id"
  }')

echo "$DUPLICATE_RESPONSE" | jq '.'

DUP_STATUS=$(echo "$DUPLICATE_RESPONSE" | jq -r '.status_code')
if [ "$DUP_STATUS" = "400" ]; then
    echo "✅ Duplicate validation working correctly!"
else
    echo "❌ Duplicate validation failed! Expected 400, got $DUP_STATUS"
fi
echo ""

# Summary
echo "=========================================="
echo "   Test Summary"
echo "=========================================="
echo "Product Creation: $([ "$STATUS_CODE" = "200" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Get All Products: $([ "$GET_STATUS" = "200" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Duplicate Check:  $([ "$DUP_STATUS" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo ""
echo "Created Product UUID for further testing: $PRODUCT_UUID"
echo "=========================================="