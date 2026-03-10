# Preceptoria V2

A comprehensive student management system for healthcare education institutions, specifically designed for **Faculdade Santa Casa** and the **Fisioterapia em Neonatologia e Pediatria** course.

## 🚀 Key Features

### 📊 Advanced Data Processing
- **Multi-form consolidation**: Processes data from 4 merged Google Forms
- **Crefito-based grouping**: Uses professional identity numbers for reliable student matching
- **Smart deduplication**: Removes duplicate documents while preserving all unique files
- **Data validation**: Automatically formats phone numbers and emails to pass validation
- **99.46% data completion** achieved in production

### 🏥 Healthcare Institution Management
- **Multi-hospital support**: Hospital Municipal de Salvador and Hospital Santa Isabel
- **Role-based access control**: SysAdmin, OrgAdmin, Supervisor, HospitalManager, Preceptor, Student
- **Document management**: Vaccination cards, professional IDs, commitment terms, hospital forms
- **Class organization**: Dynamic class creation from Google Sheets data

### 🔄 Automated Data Sync
- **Daily Google Sheets sync**: Runs automatically at 3am
- **Real-time updates**: Processes new submissions and updates
- **Data protection**: Smart field updates prevent overwriting meaningful data
- **Validation compliance**: All data passes entity validation

## 📦 Project Structure

```
PreceptoriaV2/
├── packages/
│   ├── elysia/          # Main backend API (Elysia + MikroORM)
│   ├── nestjs/          # Alternative backend (NestJS)
│   ├── web/             # Frontend (Next.js + TypeScript)
│   └── old-domain/      # Legacy domain logic
├── docs/                # Documentation
└── README.md           # This file
```

## 🛠️ Quick Start

### Prerequisites
- **Bun** (latest version)
- **PostgreSQL** database
- **Google Cloud** service account (for Sheets integration)

### Installation

```bash
# Install dependencies
bun install

# Set up environment
cd packages/elysia
cp env.example .env
# Edit .env with your database credentials

# Run migrations
bun run db:migration:up

# Seed the database
bun run db:seed

# Start development server
bun run dev
```

## 📚 Documentation

- **[Seeding Guide](packages/elysia/SEEDING_GUIDE.md)**: Complete database seeding documentation
- **[API Documentation](docs/Endpoints.md)**: API endpoints and usage
- **[Authentication](docs/Auth%20Module.md)**: Authentication and authorization
- **[Permissions](docs/Permissions.md)**: Role-based permissions system

## 🎯 Recent Improvements (July 2025)

- ✅ **Enhanced data consolidation** with Crefito-based grouping
- ✅ **Multi-form processing** from 4 different Google Forms
- ✅ **Smart deduplication** preserving all unique documents
- ✅ **Phone number cleaning** for Brazilian format validation
- ✅ **Professional identity number storage** in database
- ✅ **99.46% data completion rate** achieved

## 🤝 Contributing

This project was created using `bun init` in bun v1.1.26. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
