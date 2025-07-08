# Cursor Development Rules

## 🎯 **Core Rules**

### 1. **Endpoint Documentation Rule** 
- **When:** Modify any `.controller.ts` file
- **Action:** Update `packages/elysia/endpoints.jsonl` with request/response shapes
- **When:** Add new API calls to `packages/web/lib/eden.ts`
- **Action:** Read `packages/elysia/endpoints.jsonl` first to understand the contract
- **Why:** Prevents source code combing and ensures type consistency

### 2. **Type Safety Rule**
- **When:** Adding new entities or changing entity properties
- **Action:** Update both backend entity AND frontend type definitions
- **Why:** Prevents property name mismatches (e.g., `phone` vs `phoneNumber`)

### 3. **Cookie Security Rule**
- **When:** Working with authentication/sessions
- **Action:** Always use `secure: Bun.env.NODE_ENV === 'production'` and `sameSite: "lax"`
- **Why:** Prevents cookie issues in development while maintaining security in production

### 4. **Frontend-First Rule**
- **When:** Making API changes
- **Action:** Prefer modifying the frontend to match backend types rather than changing backend
- **Why:** Backend types are more stable, frontend is more flexible

### 5. **Environment Variable Rule**
- **When:** Adding new environment variables
- **Action:** Update both `.env.example` AND the validation in `packages/elysia/src/index.ts`
- **Why:** Prevents missing env vars and ensures proper documentation

### 6. **Database Migration Rule**
- **When:** Changing entity schemas
- **Action:** Create migration AND update seeder data
- **Why:** Keeps dev environment in sync and prevents data inconsistencies

## 🚀 **Future Rules (Post-MVP)**

### 7. **MVP Completion Rule**
- **When:** User declares MVP is complete
- **Action:** Re-evaluate and implement:
  - Error handling consistency rules
  - Logging pattern rules
  - Testing coverage rules
  - API versioning rules
- **Why:** Focus on implementation now, quality standards later

## 📋 **Implementation Notes**

- **endpoints.jsonl format:** JSONL for easy parsing and diffing
- **Security first:** No hardcoded credentials, proper environment-based configs
- **Type consistency:** Backend entities drive frontend types
- **Documentation:** Keep endpoints.jsonl updated for all API changes

## 🔄 **Workflow**

1. **Adding new endpoint:**
   - Update controller
   - Update endpoints.jsonl
   - Update frontend API client

2. **Changing entity:**
   - Update backend entity
   - Update frontend types
   - Create migration if needed
   - Update seeders if needed

3. **Adding env vars:**
   - Update .env.example
   - Update validation in index.ts
   - Document in README if needed 