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

## Duplicate Handling ✅

The system has robust duplicate handling in place:

### 1. Sync Service Duplicate Prevention

**Students**: Checked by email before creation
```typescript
const existingStudent = await db.student.findOne({
    user: { email: submission.email }
});
```

**Documents**: Checked by Google Drive ID before creation
```typescript
const existingDoc = await db.document.findOne({
    googleDriveId: fileId,
    student: student.id,
});
```

### 2. Seeder Duplicate Prevention

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

### Data Flow
1. **Fetch**: Gets submissions from Google Sheets
2. **Process**: Maps to internal entities
3. **Check**: Prevents duplicates
4. **Create**: Only creates new entities
5. **Log**: Provides detailed statistics

### Document Types
Based on the `GoogleSheetsSubmission` interface:
- Vaccination Card
- Professional Identity (Front/Back)
- Internship Commitment Term
- City Hospital Form
- Badge Picture

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