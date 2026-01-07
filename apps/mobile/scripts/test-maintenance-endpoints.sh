#!/bin/bash
# Test Maintenance Endpoints
# Usage: ./scripts/test-maintenance-endpoints.sh [API_URL] [JWT_TOKEN] [PRODUCT_UUID]

# Configuration
API_URL="${1:-http://localhost:3000}"
JWT_TOKEN="${2:-your-jwt-token-here}"
PRODUCT_UUID="${3}"

if [ -z "$PRODUCT_UUID" ]; then
    echo "❌ Error: PRODUCT_UUID is required!"
    echo "Usage: $0 [API_URL] [JWT_TOKEN] PRODUCT_UUID"
    echo ""
    echo "First create a product using test-product-endpoints.sh"
    exit 1
fi

echo "=========================================="
echo "   Testing Maintenance Endpoints"
echo "=========================================="
echo "API URL: $API_URL"
echo "Product UUID: $PRODUCT_UUID"
echo ""

# Test 1: Create Maintenance - Installazione
echo "🔧 Test 1: Creating maintenance (installazione)..."
echo "------------------------------------------"

TIMESTAMP=$(date +%s)
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "installazione",
    "gps_lat": 45.464211,
    "gps_lng": 9.189982,
    "year": 2024,
    "poles_number": 2,
    "company_id": "test-company-id",
    "certificate_number": "TEST-INST-'$TIMESTAMP'",
    "reason": "Test automatico installazione",
    "notes": "Installazione test presso Via Roma 123, Milano. Script automatico.",
    "product_uuid": "'$PRODUCT_UUID'"
  }')

echo "$CREATE_RESPONSE" | jq '.'

STATUS_CODE=$(echo "$CREATE_RESPONSE" | jq -r '.status_code')
MAINT_UUID=$(echo "$CREATE_RESPONSE" | jq -r '.payload.data.uuid')
TX_ID=$(echo "$CREATE_RESPONSE" | jq -r '.payload.data.transaction_id')
MAINT_CID=$(echo "$CREATE_RESPONSE" | jq -r '.payload.data.metadata_cid')

if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ Maintenance created successfully!"
    echo "   UUID: $MAINT_UUID"
    echo "   Transaction ID: $TX_ID"
    echo "   Metadata CID: $MAINT_CID"
else
    echo "❌ Maintenance creation failed!"
fi
echo ""

# Test 2: Create Maintenance - Manutenzione
echo "🔧 Test 2: Creating maintenance (manutenzione ordinaria)..."
echo "------------------------------------------"

MAINT_RESPONSE=$(curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "manutenzione",
    "gps_lat": 41.902783,
    "gps_lng": 12.496366,
    "year": 2024,
    "poles_number": 1,
    "company_id": "test-company-id",
    "certificate_number": "TEST-MAINT-'$TIMESTAMP'",
    "reason": "Test manutenzione ordinaria semestrale",
    "notes": "Pulizia, verifica retroriflettenza, controllo fissaggi. Test automatico.",
    "product_uuid": "'$PRODUCT_UUID'"
  }')

echo "$MAINT_RESPONSE" | jq '.'

MAINT_STATUS=$(echo "$MAINT_RESPONSE" | jq -r '.status_code')
if [ "$MAINT_STATUS" = "200" ]; then
    echo "✅ Second maintenance created successfully!"
else
    echo "❌ Second maintenance creation failed!"
fi
echo ""

# Test 3: Get All Maintenances
echo "📋 Test 3: Retrieving all maintenances..."
echo "------------------------------------------"

GET_RESPONSE=$(curl -s -X GET "$API_URL/maintenance" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "$GET_RESPONSE" | jq '.'

MAINT_COUNT=$(echo "$GET_RESPONSE" | jq '.payload.data | length')
GET_STATUS=$(echo "$GET_RESPONSE" | jq -r '.status_code')

if [ "$GET_STATUS" = "200" ]; then
    echo "✅ Maintenances retrieved successfully!"
    echo "   Total maintenances: $MAINT_COUNT"
else
    echo "❌ Failed to retrieve maintenances!"
fi
echo ""

# Test 4: Invalid Product UUID (Should Fail)
echo "❌ Test 4: Testing invalid product UUID (should fail)..."
echo "------------------------------------------"

INVALID_RESPONSE=$(curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "verifica",
    "gps_lat": 45.464211,
    "gps_lng": 9.189982,
    "company_id": "test-company",
    "certificate_number": "TEST-INVALID",
    "reason": "Test invalid UUID",
    "notes": "This should fail",
    "product_uuid": "non-existent-uuid-999"
  }')

echo "$INVALID_RESPONSE" | jq '.'

INVALID_STATUS=$(echo "$INVALID_RESPONSE" | jq -r '.status_code')
if [ "$INVALID_STATUS" = "400" ]; then
    echo "✅ Invalid product UUID validation working correctly!"
else
    echo "❌ Invalid product UUID validation failed! Expected 400, got $INVALID_STATUS"
fi
echo ""

# Summary
echo "=========================================="
echo "   Test Summary"
echo "=========================================="
echo "Create Maintenance 1: $([ "$STATUS_CODE" = "200" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Create Maintenance 2: $([ "$MAINT_STATUS" = "200" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Get All Maintenances: $([ "$GET_STATUS" = "200" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Invalid UUID Check:   $([ "$INVALID_STATUS" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo ""
echo "Blockchain Transaction ID: $TX_ID"
echo "=========================================="