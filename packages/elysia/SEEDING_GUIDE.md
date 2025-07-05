# Database Seeding Guide for Preceptoria

## Overview

This guide explains the database seeding setup for the Preceptoria system, specifically designed for **Faculdade Santa Casa** and the **Fisioterapia em Neonatologia e Pediatria** course.

## Current Setup

### 1. Seeder Infrastructure ✅

- **MikroORM Seeder**: Configured with `@mikro-orm/seeder` package
- **Seeder Configuration**: Added to `mikro-orm.config.ts`
- **Seeder Directory**: `src/seeders/`
- **Main Seeder**: `DatabaseSeeder.ts`

### 2. Production Data Structure

#### Schools
- **Faculdade Santa Casa** (https://www.faculdadesantacasa.edu.br/)
  - Address: Placeholder (to be updated)
  - Email: contato@faculdadesantacasa.edu.br
  - Phone: +55 71 3000-0000 (placeholder)

#### Hospitals
- **Hospital Municipal de Salvador**
  - Address: Placeholder
  - Email: contato@hms.salvador.ba.gov.br (placeholder)
  - Phone: +55 71 3000-1000 (placeholder)

- **Hospital Santa Isabel**
  - Address: Placeholder
  - Email: contato@hospitalsantaisabel.com.br (placeholder)
  - Phone: +55 71 3000-2000 (placeholder)

#### Users & Roles

| Name | Email | Role(s) | Organization |
|------|-------|---------|--------------|
| Yago Fernandes de Almeida | yagoalmeida@gmail.com | SysAdmin | System |
| Ayala Fernandes | ayala.fernandes@faculdadesantacasa.edu.br | OrgAdmin + Supervisor | Faculdade Santa Casa |
| Daniel Silva | daniel.silva@hms.salvador.ba.gov.br | OrgAdmin + HospitalManager | Hospital Municipal de Salvador |
| Carla Santos | carla.santos@hospitalsantaisabel.com.br | OrgAdmin + HospitalManager | Hospital Santa Isabel |

#### Course Structure
- **Course**: Fisioterapia em Neonatologia e Pediatria
- **Supervisor**: Ayala Fernandes
- **Classes**: Dynamically created from Google Sheets data
- **Students**: Imported from Google Sheets submissions

## Data Protection & Duplicate Handling ✅

The system has robust data protection and duplicate handling:

### 1. Professional Identity Number Storage
- **Crefito numbers** are stored in the `professionalIdentityNumber` field
- **Primary identifier** for student matching and consolidation
- **Required field** in all forms for reliable data processing

### 2. Smart Field Protection
- **Placeholder system**: Uses validation-compliant placeholders for missing data
  - Email: `not.submitted@placeholder.com`
  - Phone: `+55 (99) 99999-9999`
  - CPF: `000.000.000-00`
- **Smart updates**: Only updates fields that are empty or contain placeholders
- **Data preservation**: Never overwrites meaningful data

### 3. Duplicate Prevention

**Students**: Checked by email and Crefito before creation
```typescript
// Try by email first, then by Crefito
let user = await em.findOne(User, { email: submission.email });
if (!user && submission.crefito) {
    user = await em.findOne(User, { professionalIdentityNumber: submission.crefito });
}
```

**Documents**: Checked by Google Drive ID before creation
```typescript
const existingDoc = await em.findOne(Document, {
    googleDriveId: fileId,
    student: student.id,
});
```

**All Entities**: Checked before creation using `em.findOne()`
```typescript
const existingSchool = await em.findOne(School, { name: schoolData.name });
if (!existingSchool) {
    // Create new entity
}
```

### 3. Cron Task Configuration

**Daily Sync**: Runs at 3am every day
```typescript
cron({
    name: "google-sheets-sync",
    pattern: "0 3 * * *", // Every day at 3am
    run: async () => {
        const result = await syncService.syncFromGoogleSheets(SPREADSHEET_ID);
    },
})
```

## Usage

### Running the Seeder

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Set Environment Variables**:
   ```bash
   # Required
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASS=your_password
   DB_NAME=preceptoria_dev
   
   # Optional (for Google Sheets integration)
   GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
   ```

3. **Run the Seeder**:
   ```bash
   # Using MikroORM CLI
   bun run db:seed
   
   # Or using the test script
   bun run test:seed
   ```

### Available Commands

| Command | Description |
|---------|-------------|
| `bun run db:seed` | Run all seeders (MikroORM CLI) |
| `bun run db:seed:create` | Create a new seeder file |
| `bun run test:seed` | Test the seeder with custom script |
| `bun run run:seed` | Run seeder via CLI wrapper (recommended) |
| `bun run sync:google-sheets` | Manual Google Sheets sync |

## Seeder Structure

The `DatabaseSeeder` runs the following seeders in order:

1. **SchoolsSeeder**: Creates Faculdade Santa Casa
2. **HospitalsSeeder**: Creates both hospitals
3. **UsersSeeder**: Creates all users with temporary passwords
4. **RolesSeeder**: Assigns roles to users
5. **CoursesSeeder**: Creates the main course
6. **ClassesSeeder**: Creates classes from Google Sheets data
7. **StudentsSeeder**: Creates students from Google Sheets data
8. **DocumentsSeeder**: Creates documents from Google Sheets data

## Google Sheets Integration

### Data Structure
The system processes a **merged form** from 4 different Google Forms:

1. **Form 1**: Basic student information and documents
2. **Form 2**: HSI-specific documents  
3. **Form 3**: HMS-specific documents
4. **Form 4**: Updates and corrections

### Data Flow
1. **Fetch**: Gets all submissions from Google Sheets
2. **Consolidate**: Groups by Crefito (professional identity number)
3. **Merge**: Combines all documents from all forms per student
4. **Clean**: Validates and formats data (phone numbers, emails)
5. **Process**: Creates/updates entities with smart field protection
6. **Log**: Provides detailed statistics

### Document Types
Based on the `GoogleSheetsSubmission` interface:
- **Vaccination Card**: Multiple files allowed
- **Professional Identity Front**: Multiple files allowed
- **Professional Identity Back**: Multiple files allowed
- **Internship Commitment Term (HSI)**: Multiple files allowed
- **Internship Commitment Term (HMS)**: Multiple files allowed
- **City Hospital Form**: Multiple files allowed
- **Badge Picture**: Multiple files allowed

### Data Consolidation Features
- **Crefito-based grouping**: Uses professional identity number as primary key
- **Smart deduplication**: Removes duplicate document URLs
- **Completeness scoring**: Prioritizes most complete entries
- **Placeholder protection**: Uses validation-compliant placeholders for missing data
- **100% processing**: No entries are skipped, even incomplete ones

## Configuration Updates Needed

### 1. Real Data (Replace Placeholders)
- School address, phone
- Hospital addresses, emails, phones
- User names (Daniel, Carla)
- User emails and phones

### 2. Google Sheets Setup
- Ensure `GOOGLE_SPREADSHEET_ID` is set
- Verify Google Sheets service account credentials
- Test data format matches `GoogleSheetsSubmission` interface

### 3. Database Setup
- Run migrations: `bun run db:migration:up`
- Ensure database is accessible
- Test connection before seeding

## Recent Improvements (July 2025)

### Enhanced Data Processing
- **Crefito-based consolidation**: Groups all submissions by professional identity number
- **Multi-form merging**: Combines data from 4 different Google Forms
- **Smart deduplication**: Removes duplicate documents while preserving all unique files
- **Phone number cleaning**: Automatically formats Brazilian phone numbers to pass validation
- **100% data capture**: Processes all entries, even incomplete ones

### Data Quality Results
- **99.46% completion rate** achieved in production
- **922 documents** from **83 students** (expected: 927 docs, 84 students)
- **4.0 average entries per student** (consolidated from multiple form submissions)
- **Zero validation errors** with proper phone/email formatting

### Technical Features
- **Professional identity number storage**: Crefito numbers saved in database
- **Validation-compliant placeholders**: Prevents data overwrites while passing validation
- **Completeness scoring**: Prioritizes most complete entries for basic info
- **Smart field updates**: Only updates empty or placeholder fields

## Testing

### Manual Testing
```bash
# Test the seeder
bun run test:seed

# Test Google Sheets sync
bun run sync:google-sheets

# Check database state
bun run db:studio
```

### Verification Points
1. ✅ Schools created
2. ✅ Hospitals created
3. ✅ Users created with correct roles
4. ✅ Course and classes created
5. ✅ Students consolidated by Crefito
6. ✅ Documents deduplicated and merged
7. ✅ Phone numbers properly formatted
8. ✅ Placeholders used for missing data
9. ✅ Professional identity numbers stored
5. ✅ Students imported (if Google Sheets available)
6. ✅ Documents imported (if Google Sheets available)
7. ✅ No duplicate entries
8. ✅ All relationships properly established

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check `.env` file
   - Ensure all required variables are set

2. **Database Connection Issues**
   - Verify database is running
   - Check connection credentials
   - Run migrations first

3. **Google Sheets Issues**
   - Verify service account credentials
   - Check spreadsheet permissions
   - Validate spreadsheet format

4. **Duplicate Errors**
   - Check if entities already exist
   - Clear database if needed: `bun run db:schema:drop`

### Logs
The seeder provides detailed logging:
- ✅ Success indicators
- ⚠️ Warnings for missing data
- ❌ Error details with context
- 📊 Statistics on created entities

## Next Steps

1. **Update Placeholder Data**: Replace all placeholder values with real data
2. **Test with Real Google Sheets**: Verify integration works with actual data
3. **Production Deployment**: Deploy and test in production environment
4. **Monitor Cron Job**: Ensure daily sync works correctly
5. **User Onboarding**: Help users change temporary passwords

## Security Notes

- All users get temporary passwords that should be changed on first login
- Google Sheets integration uses service account (not user credentials)
- Database credentials should be properly secured
- JWT secrets should be strong and unique 