#!/bin/bash
# Master Test Runner - Esegue tutti i test in sequenza
# Usage: ./scripts/run-all-tests.sh [API_URL] [JWT_TOKEN]

# Configuration
API_URL="${1:-http://localhost:3000}"
JWT_TOKEN="${2:-your-jwt-token-here}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "   Backend API - Master Test Runner"
echo "=========================================="
echo "API URL: $API_URL"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Error: jq is not installed${NC}"
    echo "Please install jq to parse JSON responses:"
    echo "  macOS: brew install jq"
    echo "  Linux: sudo apt-get install jq"
    exit 1
fi

# Verify backend is reachable
echo -e "${BLUE}🔍 Checking backend connectivity...${NC}"
if ! curl -s --max-time 5 "$API_URL" > /dev/null; then
    echo -e "${RED}❌ Cannot reach backend at $API_URL${NC}"
    echo "Please verify:"
    echo "  - Backend server is running"
    echo "  - API_URL is correct"
    echo "  - Firewall allows connection"
    exit 1
fi
echo -e "${GREEN}✅ Backend is reachable${NC}"
echo ""

# Test 1: Product Endpoints
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Test Suite 1/4: Product Endpoints${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

./scripts/test-product-endpoints.sh "$API_URL" "$JWT_TOKEN" > /tmp/test-product-output.txt
PRODUCT_EXIT_CODE=$?

cat /tmp/test-product-output.txt

# Extract Product UUID from output
PRODUCT_UUID=$(grep "Created Product UUID for further testing:" /tmp/test-product-output.txt | awk '{print $NF}')

if [ -z "$PRODUCT_UUID" ]; then
    echo -e "${YELLOW}⚠️  Warning: Could not extract Product UUID from test output${NC}"
    echo "Creating a test product manually..."

    # Create test product manually
    TIMESTAMP=$(date +%s)
    CREATE_RESPONSE=$(curl -s -X POST "$API_URL/product/create" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "qr_code": "TEST-RUNNER-'$TIMESTAMP'",
        "signal_type": "Test Runner Product",
        "production_year": 2024,
        "shape": "Triangolare",
        "dimension": "90x90cm",
        "wl_code": "WL-RUNNER",
        "support_material": "Alluminio",
        "support_thickness": "2.5mm",
        "fixation_class": "Classe RA2",
        "fixation_method": "Palo sostegno",
        "created_by": "test-runner"
      }')

    PRODUCT_UUID=$(echo "$CREATE_RESPONSE" | jq -r '.payload.data.uuid')

    if [ -z "$PRODUCT_UUID" ] || [ "$PRODUCT_UUID" = "null" ]; then
        echo -e "${RED}❌ Failed to create test product. Cannot continue.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Test product created: $PRODUCT_UUID${NC}"
fi

echo ""
echo -e "${GREEN}Product UUID for next tests: $PRODUCT_UUID${NC}"
echo ""

# Test 2: Maintenance Endpoints
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Test Suite 2/4: Maintenance Endpoints${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

./scripts/test-maintenance-endpoints.sh "$API_URL" "$JWT_TOKEN" "$PRODUCT_UUID"
MAINTENANCE_EXIT_CODE=$?

echo ""

# Test 3: GPS Validation
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Test Suite 3/4: GPS Validation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

./scripts/test-gps-validation.sh "$API_URL" "$JWT_TOKEN" "$PRODUCT_UUID"
GPS_EXIT_CODE=$?

echo ""

# Test 4: Error Handling
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Test Suite 4/4: Error Handling${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

./scripts/test-error-handling.sh "$API_URL" "$JWT_TOKEN"
ERROR_EXIT_CODE=$?

echo ""

# Final Summary
echo ""
echo "=========================================="
echo "   Final Test Report"
echo "=========================================="
echo ""

TOTAL_TESTS=4
PASSED_TESTS=0

if [ $PRODUCT_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Product Endpoints:    PASSED${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ Product Endpoints:    FAILED${NC}"
fi

if [ $MAINTENANCE_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Maintenance Endpoints: PASSED${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ Maintenance Endpoints: FAILED${NC}"
fi

if [ $GPS_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ GPS Validation:       PASSED${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ GPS Validation:       FAILED${NC}"
fi

if [ $ERROR_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Error Handling:       PASSED${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ Error Handling:       FAILED${NC}"
fi

echo ""
echo "=========================================="
echo -e "Test Results: ${GREEN}$PASSED_TESTS${NC}/$TOTAL_TESTS passed"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All tests passed! Backend is ready.${NC}"
    EXIT_CODE=0
elif [ $PASSED_TESTS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Some tests failed. Review output above.${NC}"
    EXIT_CODE=1
else
    echo -e "${RED}❌ All tests failed. Backend needs fixes.${NC}"
    EXIT_CODE=2
fi

echo "=========================================="
echo ""

# Save report to file
REPORT_FILE="/tmp/backend-test-report-$(date +%Y%m%d-%H%M%S).txt"
echo "Test report saved to: $REPORT_FILE"

cat > "$REPORT_FILE" << EOF
Backend API Test Report
=======================
Timestamp: $(date '+%Y-%m-%d %H:%M:%S')
API URL: $API_URL
Product UUID: $PRODUCT_UUID

Results:
--------
Product Endpoints:    $([ $PRODUCT_EXIT_CODE -eq 0 ] && echo "PASSED" || echo "FAILED")
Maintenance Endpoints: $([ $MAINTENANCE_EXIT_CODE -eq 0 ] && echo "PASSED" || echo "FAILED")
GPS Validation:       $([ $GPS_EXIT_CODE -eq 0 ] && echo "PASSED" || echo "FAILED")
Error Handling:       $([ $ERROR_EXIT_CODE -eq 0 ] && echo "PASSED" || echo "FAILED")

Total: $PASSED_TESTS/$TOTAL_TESTS tests passed
Status: $([ $EXIT_CODE -eq 0 ] && echo "SUCCESS" || echo "NEEDS REVIEW")
EOF

exit $EXIT_CODE