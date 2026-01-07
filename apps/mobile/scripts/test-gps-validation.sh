#!/bin/bash
# Test GPS Coordinate Validation
# Usage: ./scripts/test-gps-validation.sh [API_URL] [JWT_TOKEN] [PRODUCT_UUID]

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
echo "   Testing GPS Coordinate Validation"
echo "=========================================="
echo "API URL: $API_URL"
echo "Product UUID: $PRODUCT_UUID"
echo ""
echo "GPS Rules:"
echo "  - Max 6 decimal places"
echo "  - Max 9 total digits (including decimals)"
echo "  - Latitude: -90 to 90"
echo "  - Longitude: -180 to 180"
echo ""

# Test 1: Valid GPS - Milan, Italy
echo "✅ Test 1: Valid GPS - Milan (45.464211, 9.189982)"
echo "------------------------------------------"
echo "Total digits: lat=8, lng=7 ✅"

TEST1_RESPONSE=$(curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "verifica",
    "gps_lat": 45.464211,
    "gps_lng": 9.189982,
    "company_id": "test-company",
    "certificate_number": "GPS-TEST-1",
    "reason": "GPS validation test - Milan",
    "notes": "Valid GPS coordinates test",
    "product_uuid": "'$PRODUCT_UUID'"
  }')

echo "$TEST1_RESPONSE" | jq '.'
TEST1_STATUS=$(echo "$TEST1_RESPONSE" | jq -r '.status_code')
echo "Result: $([ "$TEST1_STATUS" = "200" ] && echo "✅ PASS (200)" || echo "❌ FAIL ($TEST1_STATUS)")"
echo ""

# Test 2: Valid GPS - Rome, Italy
echo "✅ Test 2: Valid GPS - Rome (41.902783, 12.496366)"
echo "------------------------------------------"
echo "Total digits: lat=8, lng=8 ✅"

TEST2_RESPONSE=$(curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "verifica",
    "gps_lat": 41.902783,
    "gps_lng": 12.496366,
    "company_id": "test-company",
    "certificate_number": "GPS-TEST-2",
    "reason": "GPS validation test - Rome",
    "notes": "Valid GPS coordinates test",
    "product_uuid": "'$PRODUCT_UUID'"
  }')

echo "$TEST2_RESPONSE" | jq '.'
TEST2_STATUS=$(echo "$TEST2_RESPONSE" | jq -r '.status_code')
echo "Result: $([ "$TEST2_STATUS" = "200" ] && echo "✅ PASS (200)" || echo "❌ FAIL ($TEST2_STATUS)")"
echo ""

# Test 3: Valid GPS - Max digits (9)
echo "✅ Test 3: Valid GPS - Max 9 digits (123.456789, -98.765432)"
echo "------------------------------------------"
echo "Total digits: lat=9, lng=9 ✅ (at limit)"

TEST3_RESPONSE=$(curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "verifica",
    "gps_lat": 123.456789,
    "gps_lng": -98.765432,
    "company_id": "test-company",
    "certificate_number": "GPS-TEST-3",
    "reason": "GPS validation test - Max digits",
    "notes": "Testing maximum allowed digits",
    "product_uuid": "'$PRODUCT_UUID'"
  }')

echo "$TEST3_RESPONSE" | jq '.'
TEST3_STATUS=$(echo "$TEST3_RESPONSE" | jq -r '.status_code')
echo "Result: $([ "$TEST3_STATUS" = "200" ] && echo "✅ PASS (200)" || echo "❌ FAIL ($TEST3_STATUS)")"
echo ""

# Test 4: Invalid GPS - Too many digits (10)
echo "❌ Test 4: Invalid GPS - 10 total digits (1234.567890, 9.189982)"
echo "------------------------------------------"
echo "Total digits: lat=10 ❌ (exceeds limit)"

TEST4_RESPONSE=$(curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "verifica",
    "gps_lat": 1234.567890,
    "gps_lng": 9.189982,
    "company_id": "test-company",
    "certificate_number": "GPS-TEST-4",
    "reason": "GPS validation test - Too many digits",
    "notes": "This should fail - exceeds 9 total digits",
    "product_uuid": "'$PRODUCT_UUID'"
  }')

echo "$TEST4_RESPONSE" | jq '.'
TEST4_STATUS=$(echo "$TEST4_RESPONSE" | jq -r '.status_code')
echo "Result: $([ "$TEST4_STATUS" = "400" ] && echo "✅ PASS (400 - rejected)" || echo "❌ FAIL ($TEST4_STATUS - should be 400)")"
echo ""

# Test 5: Invalid GPS - Out of range latitude
echo "❌ Test 5: Invalid GPS - Out of range latitude (91.464211, 9.189982)"
echo "------------------------------------------"
echo "Latitude out of range: 91 > 90 ❌"

TEST5_RESPONSE=$(curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "verifica",
    "gps_lat": 91.464211,
    "gps_lng": 9.189982,
    "company_id": "test-company",
    "certificate_number": "GPS-TEST-5",
    "reason": "GPS validation test - Out of range",
    "notes": "This should fail - latitude out of range",
    "product_uuid": "'$PRODUCT_UUID'"
  }')

echo "$TEST5_RESPONSE" | jq '.'
TEST5_STATUS=$(echo "$TEST5_RESPONSE" | jq -r '.status_code')
echo "Result: $([ "$TEST5_STATUS" = "400" ] && echo "✅ PASS (400 - rejected)" || echo "❌ FAIL ($TEST5_STATUS - should be 400)")"
echo ""

# Test 6: Invalid GPS - Out of range longitude
echo "❌ Test 6: Invalid GPS - Out of range longitude (45.464211, 181.189982)"
echo "------------------------------------------"
echo "Longitude out of range: 181 > 180 ❌"

TEST6_RESPONSE=$(curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "verifica",
    "gps_lat": 45.464211,
    "gps_lng": 181.189982,
    "company_id": "test-company",
    "certificate_number": "GPS-TEST-6",
    "reason": "GPS validation test - Out of range",
    "notes": "This should fail - longitude out of range",
    "product_uuid": "'$PRODUCT_UUID'"
  }')

echo "$TEST6_RESPONSE" | jq '.'
TEST6_STATUS=$(echo "$TEST6_RESPONSE" | jq -r '.status_code')
echo "Result: $([ "$TEST6_STATUS" = "400" ] && echo "✅ PASS (400 - rejected)" || echo "❌ FAIL ($TEST6_STATUS - should be 400)")"
echo ""

# Summary
echo "=========================================="
echo "   Test Summary"
echo "=========================================="
echo "Valid GPS - Milan:        $([ "$TEST1_STATUS" = "200" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Valid GPS - Rome:         $([ "$TEST2_STATUS" = "200" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Valid GPS - Max 9 digits: $([ "$TEST3_STATUS" = "200" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Invalid - 10 digits:      $([ "$TEST4_STATUS" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Invalid - Lat range:      $([ "$TEST5_STATUS" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Invalid - Lng range:      $([ "$TEST6_STATUS" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "=========================================="