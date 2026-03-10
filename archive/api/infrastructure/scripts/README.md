# API Testing Scripts

This directory contains scripts for testing and validating the Preceptoria API.

## Available Scripts

### `test-api-simple.sh` - API Sanity Check

A simple script that tests the essential API functionality.

**What it tests:**

- ✅ Health check
- ✅ Login with valid credentials
- ✅ Protected route access

**Usage:**

```bash
# Make sure the API server is running first
bun run dev

# In another terminal, run the test script
./scripts/test-api-simple.sh
```

**Expected output:**

```
==========================================
🚀 Preceptoria API Sanity Check
==========================================

[INFO] Checking server health...
[SUCCESS] Server is healthy
[INFO] Logging in...
[SUCCESS] Logged in as: Yago Fernandes de Almeida
[INFO] Testing protected route: /classes
[SUCCESS] Retrieved 5 classes

🎉 API is working correctly!
```

## Prerequisites

- **curl**: For making HTTP requests
- **jq**: For JSON parsing (install with `pacman -S jq` on Arch Linux)
- **API Server**: Must be running on `http://localhost:3000`

## Default Test Credentials

The scripts use the default SysAdmin user created by the database seeder:

- **Email**: `yagoalmeida@gmail.com`
- **Password**: `TotallyS3cr3tP4ssw_rd`

## Troubleshooting

### Script fails with "jq not found"

```bash
# Install jq on Arch Linux
sudo pacman -S jq

# Or on Ubuntu/Debian
sudo apt install jq

# Or on macOS
brew install jq
```

### Script fails with "API server is not running"

```bash
# Start the API server
bun run dev

# Or check if it's running on a different port
# Edit the API_BASE_URL in the script if needed
```

### Script fails with authentication errors

```bash
# Make sure the database is seeded
bun run db:seed

# Or run the seeder test
bun run test:seed
```

## Integration with CI/CD

You can integrate these scripts into your CI/CD pipeline:

```bash
# Example GitHub Actions step
- name: Test API
  run: |
    cd apps/api
    ./scripts/test-api-simple.sh
```

## Manual Testing

If you want to test manually with curl:

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Login
curl -c cookies.txt -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "yagoalmeida@gmail.com", "password": "TotallyS3cr3tP4ssw_rd"}'

# 3. Access protected route
curl -b cookies.txt http://localhost:3000/classes

# 4. Cleanup
rm cookies.txt
```

## Script Features

- **Colored output**: Easy to read success/error messages
- **Comprehensive testing**: Covers all major API functionality
- **Cookie handling**: Properly manages session cookies
- **Cleanup**: Automatically removes temporary files
- **Error handling**: Clear error messages and exit codes
- **JSON parsing**: Uses jq for reliable JSON response parsing
