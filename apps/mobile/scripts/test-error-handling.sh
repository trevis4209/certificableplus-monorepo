#!/bin/bash
# Test Error Handling
# Usage: ./scripts/test-error-handling.sh [API_URL] [JWT_TOKEN]

# Configuration
API_URL="${1:-http://localhost:3000}"
JWT_TOKEN="${2:-your-jwt-token-here}"

echo "=========================================="
echo "   Testing Error Handling"
echo "=========================================="
echo "API URL: $API_URL"
echo ""

# Test 1: Unauthorized - No Token
echo "🔐 Test 1: Unauthorized request (no token)"
echo "------------------------------------------"

NO_TOKEN_RESPONSE=$(curl -s -X GET "$API_URL/product")

echo "$NO_TOKEN_RESPONSE" | jq '.'
NO_TOKEN_STATUS=$(echo "$NO_TOKEN_RESPONSE" | jq -r '.status_code')

if [ "$NO_TOKEN_STATUS" = "401" ]; then
    echo "✅ Correctly rejected with 401 Unauthorized"
else
    echo "❌ Expected 401, got $NO_TOKEN_STATUS"
fi
echo ""

# Test 2: Unauthorized - Invalid Token
echo "🔐 Test 2: Invalid JWT token"
echo "------------------------------------------"

INVALID_TOKEN_RESPONSE=$(curl -s -X GET "$API_URL/product" \
  -H "Authorization: Bearer INVALID_TOKEN_12345")

echo "$INVALID_TOKEN_RESPONSE" | jq '.'
INVALID_TOKEN_STATUS=$(echo "$INVALID_TOKEN_RESPONSE" | jq -r '.status_code')

if [ "$INVALID_TOKEN_STATUS" = "401" ]; then
    echo "✅ Correctly rejected with 401 Unauthorized"
else
    echo "❌ Expected 401, got $INVALID_TOKEN_STATUS"
fi
echo ""

# Test 3: Duplicate QR Code
echo "🔁 Test 3: Duplicate QR code (SHA-256 collision)"
echo "------------------------------------------"

UNIQUE_QR="DUPLICATE-TEST-$(date +%s)"

# Create first product
echo "Creating first product with QR: $UNIQUE_QR"
FIRST_CREATE=$(curl -s -X POST "$API_URL/product/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "'$UNIQUE_QR'",
    "signal_type": "Test Duplicate",
    "production_year": 2024,
    "shape": "Test",
    "dimension": "Test",
    "support_material": "Test",
    "support_thickness": "Test",
    "fixation_class": "Test",
    "fixation_method": "Test",
    "created_by": "test"
  }')

FIRST_STATUS=$(echo "$FIRST_CREATE" | jq -r '.status_code')
echo "First creation status: $FIRST_STATUS"

if [ "$FIRST_STATUS" = "200" ]; then
    echo "✅ First product created successfully"

    # Try to create duplicate
    echo ""
    echo "Attempting to create duplicate..."
    DUPLICATE_CREATE=$(curl -s -X POST "$API_URL/product/create" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "qr_code": "'$UNIQUE_QR'",
        "signal_type": "Test Duplicate",
        "production_year": 2024,
        "shape": "Test",
        "dimension": "Test",
        "support_material": "Test",
        "support_thickness": "Test",
        "fixation_class": "Test",
        "fixation_method": "Test",
        "created_by": "test"
      }')

    echo "$DUPLICATE_CREATE" | jq '.'
    DUPLICATE_STATUS=$(echo "$DUPLICATE_CREATE" | jq -r '.status_code')

    if [ "$DUPLICATE_STATUS" = "400" ]; then
        echo "✅ Duplicate correctly rejected with 400"
    else
        echo "❌ Expected 400, got $DUPLICATE_STATUS"
    fi
else
    echo "❌ First product creation failed, cannot test duplicate"
fi
echo ""

# Test 4: Product Not Found
echo "❓ Test 4: Maintenance for non-existent product"
echo "------------------------------------------"

NOT_FOUND_RESPONSE=$(curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "verifica",
    "gps_lat": 45.464211,
    "gps_lng": 9.189982,
    "company_id": "test",
    "certificate_number": "TEST",
    "reason": "Test",
    "notes": "Test",
    "product_uuid": "non-existent-uuid-99999999"
  }')

echo "$NOT_FOUND_RESPONSE" | jq '.'
NOT_FOUND_STATUS=$(echo "$NOT_FOUND_RESPONSE" | jq -r '.status_code')

if [ "$NOT_FOUND_STATUS" = "400" ]; then
    echo "✅ Correctly rejected with 400 (product not found)"
else
    echo "❌ Expected 400, got $NOT_FOUND_STATUS"
fi
echo ""

# Test 5: Missing Required Fields
echo "📝 Test 5: Missing required fields"
echo "------------------------------------------"

MISSING_FIELDS_RESPONSE=$(curl -s -X POST "$API_URL/product/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "TEST-MISSING-FIELDS",
    "signal_type": "Test"
  }')

echo "$MISSING_FIELDS_RESPONSE" | jq '.'
MISSING_STATUS=$(echo "$MISSING_FIELDS_RESPONSE" | jq -r '.status_code')

if [ "$MISSING_STATUS" = "400" ]; then
    echo "✅ Correctly rejected with 400 (missing required fields)"
else
    echo "❌ Expected 400, got $MISSING_STATUS"
fi
echo ""

# Test 6: Invalid Data Types
echo "🔢 Test 6: Invalid data types"
echo "------------------------------------------"

INVALID_TYPE_RESPONSE=$(curl -s -X POST "$API_URL/product/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "TEST-INVALID-TYPE",
    "signal_type": "Test",
    "production_year": "not-a-number",
    "shape": "Test",
    "dimension": "Test",
    "support_material": "Test",
    "support_thickness": "Test",
    "fixation_class": "Test",
    "fixation_method": "Test",
    "created_by": "test"
  }')

echo "$INVALID_TYPE_RESPONSE" | jq '.'
INVALID_TYPE_STATUS=$(echo "$INVALID_TYPE_RESPONSE" | jq -r '.status_code')

if [ "$INVALID_TYPE_STATUS" = "400" ]; then
    echo "✅ Correctly rejected with 400 (invalid data type)"
else
    echo "❌ Expected 400, got $INVALID_TYPE_STATUS"
fi
echo ""

# Test 7: Server Error Simulation (Wrong Endpoint)
echo "🌐 Test 7: Non-existent endpoint (404)"
echo "------------------------------------------"

NOT_FOUND_ENDPOINT=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/nonexistent-endpoint" \
  -H "Authorization: Bearer $JWT_TOKEN")

HTTP_CODE=$(echo "$NOT_FOUND_ENDPOINT" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
    echo "✅ Correctly returned 404 for non-existent endpoint"
else
    echo "❌ Expected 404, got $HTTP_CODE"
fi
echo ""

# Summary
echo "=========================================="
echo "   Test Summary"
echo "=========================================="
echo "No Token (401):           $([ "$NO_TOKEN_STATUS" = "401" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Invalid Token (401):      $([ "$INVALID_TOKEN_STATUS" = "401" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Duplicate QR (400):       $([ "$DUPLICATE_STATUS" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Product Not Found (400):  $([ "$NOT_FOUND_STATUS" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Missing Fields (400):     $([ "$MISSING_STATUS" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Invalid Type (400):       $([ "$INVALID_TYPE_STATUS" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Not Found Endpoint (404): $([ "$HTTP_CODE" = "404" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "=========================================="