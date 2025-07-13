#!/bin/bash

# Simple API Sanity Check Script for Preceptoria
# Tests: Health check → Login → Protected route access

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="http://localhost:3000"
COOKIE_FILE="test_cookies.txt"

# Default credentials (from seeder)
EMAIL="yagoalmeida@gmail.com"
PASSWORD="TotallyS3cr3tP4ssw_rd"

echo "=========================================="
echo "🚀 Preceptoria API Sanity Check"
echo "=========================================="
echo ""

# Test 1: Health check
echo -e "${BLUE}[INFO]${NC} Checking server health..."
response=$(curl -s "$API_BASE_URL/health")
status=$(echo "$response" | jq -r '.status' 2>/dev/null || echo "unknown")

if [ "$status" = "ok" ]; then
    echo -e "${GREEN}[SUCCESS]${NC} Server is healthy"
else
    echo -e "${RED}[ERROR]${NC} Health check failed: $response"
    exit 1
fi

# Test 2: Login and get cookies
echo -e "${BLUE}[INFO]${NC} Logging in..."
rm -f "$COOKIE_FILE"

response=$(curl -s -c "$COOKIE_FILE" \
    -X POST "$API_BASE_URL/auth/signin" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

success=$(echo "$response" | jq -r '.success' 2>/dev/null || echo "false")

if [ "$success" = "true" ]; then
    user_name=$(echo "$response" | jq -r '.user.name' 2>/dev/null || echo "Unknown")
    echo -e "${GREEN}[SUCCESS]${NC} Logged in as: $user_name"
else
    echo -e "${RED}[ERROR]${NC} Login failed: $response"
    exit 1
fi

# Test 3: Protected route
echo -e "${BLUE}[INFO]${NC} Testing protected route: /classes"
response=$(curl -s -b "$COOKIE_FILE" \
    -X GET "$API_BASE_URL/classes")

success=$(echo "$response" | jq -r '.success' 2>/dev/null || echo "false")

if [ "$success" = "true" ]; then
    class_count=$(echo "$response" | jq '.data | length' 2>/dev/null || echo "0")
    echo -e "${GREEN}[SUCCESS]${NC} Retrieved $class_count classes"
else
    echo -e "${RED}[ERROR]${NC} Protected route failed: $response"
    exit 1
fi

# Cleanup
rm -f "$COOKIE_FILE"

echo ""
echo -e "${GREEN}🎉 API is working correctly!${NC}" 