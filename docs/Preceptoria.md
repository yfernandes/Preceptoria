# Preceptoria - Internship Admission Manager

## Introduction

The **Preceptoria Internship Admission Manager** is a comprehensive system designed to streamline the process of handling student applications, documentation, and shift scheduling for internships. This project addresses the challenges of managing internship documentation through a modern, role-based platform that enables efficient coordination between students, supervisors, administrators, and hospital partners.

### Current Status: MVP Development (Supervisor-Focused)

The system is currently in MVP development with a focus on **supervisor workflow**, as supervisors will be the first users of the platform. This MVP emphasizes document validation and management capabilities that supervisors need to handle student documentation effectively.

### Problem Statement

The existing system relies on Google Forms and Sheets, requiring significant manual oversight and prone to data inaccuracies. Current challenges include:

1. **Document Validation Complexity**: Multiple document submissions lead to redundancies and inconsistencies
2. **Manual Processing**: Folder-based file management is limiting and not scalable
3. **Lack of Supervisor Control**: Supervisors cannot upload or edit documents on behalf of students
4. **Poor Document Compilation**: Current exports lack structure and clarity

### Solution Overview

Preceptoria provides a structured, cloud-based solution that enables:
- **Role-based document management** with supervisor-focused workflows
- **Secure document storage** with metadata handling
- **Hospital/school-based access control** for supervisors
- **Streamlined shift scheduling** and management
- **Comprehensive reporting** and validation tools

## Current Implementation

### Technology Stack

- **Backend**: Elysia.js with TypeScript for high-performance API development
- **Frontend**: Next.js with React and TypeScript for modern, responsive UI
- **Database**: PostgreSQL with MikroORM for robust data management
- **Authentication**: JWT-based authentication with role-based access control
- **Development**: Bun runtime for fast development and testing
- **Deployment**: Vercel (planned) for simple, scalable deployment

### Core Features (Implemented)

#### 1. Authentication & Authorization
- JWT-based authentication system
- Role-based access control (RBAC) with granular permissions
- Support for multiple user roles: SysAdmin, OrgAdmin, Supervisor, HospitalManager, Preceptor, Student

#### 2. Document Management
- Document upload and metadata tracking
- Role-based document access and modification
- Supervisor ability to manage documents on behalf of students
- Document validation workflow

#### 3. User Management
- Multi-role user system with hierarchical permissions
- Hospital and school-based access control
- User profile management with role-specific data

#### 4. Shift Management
- Basic shift creation and management
- Hospital and preceptor associations
- Student shift assignments

#### 5. Data Models
- Comprehensive entity relationships (Users, Documents, Shifts, Hospitals, Schools, Courses, Classes)
- Proper foreign key relationships and constraints
- Audit trails and metadata tracking

### Current User Roles & Permissions

#### SysAdmin
- Full system access (`*:*:*`)
- Complete administrative control

#### OrgAdmin
- Managed access to hospitals, schools, courses, and classes
- Document management capabilities
- Administrative oversight functions

#### Supervisor (MVP Focus)
- **Own Classes**: Create, read, update, delete their assigned classes
- **Own Students**: Manage students within their assigned classes
- **Student Documents**: Upload, read, update, delete documents on behalf of students
- **Hospital Access**: View hospitals where their students have shifts

#### HospitalManager
- **Own Shifts**: Read shifts at their managed hospitals
- **Own Students**: Read student information for their hospital shifts
- **Document Access**: Read access to relevant documents
- **Class Access**: Read access to classes with students at their hospitals

#### Preceptor
- **Own Shifts**: Read shifts they are assigned to
- **Own Students**: Read student information for their shifts
- **Hospital Access**: Read access to hospitals where they work

#### Student
- **Own Documents**: Create, read, update, delete their own documents
- **Own Classes**: Read access to their assigned class
- **Own Shifts**: Read access to their assigned shifts
- **Own Profile**: Read and update their own information

## MVP Roadmap (Current Focus)

### Phase 1: Supervisor Workflow (In Progress)
- ✅ JWT authentication system
- ✅ Role-based permissions framework
- ✅ Document management system
- ✅ Basic user management
- 🔄 Supervisor document validation interface
- 🔄 Hospital/school-based access control refinement
- 🔄 Document upload on behalf of students

### Phase 2: Enhanced Supervisor Tools
- 📋 Advanced document validation workflow
- 📋 Shift scheduling interface for supervisors
- 📋 Student management dashboard
- 📋 Reporting and analytics for supervisors

### Phase 3: Student Interface
- 📋 Student document submission portal
- 📋 Student shift viewing interface
- 📋 Document status tracking for students

## Future Roadmap

### V1: Enhanced Features
- **Notifications**: Push/email notifications for key updates
- **Advanced Shift Planning**: Manual shift planner with drag-and-drop interface
- **Financial Tracking**: Enhanced teacher cost-tracking for reporting
- **Social Authentication**: Google OAuth integration

### V2: Automation & Integration
- **WhatsApp Integration**: Notifications via WhatsApp for urgent updates
- **Automated Scheduling**: Configurable student-to-teacher ratio scheduling
- **Advanced Search**: Enhanced search functionality across all entities
- **Document Templates**: Pre-filled templates for common documents

### V3: Advanced Features
- **Cloud Storage Integration**: GCP Cloud Storage for document storage
- **Advanced Reporting**: Comprehensive analytics and reporting
- **Mobile App**: Native mobile application for field use
- **API Integrations**: Third-party system integrations

## Technical Architecture

### System Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Elysia.js     │    │   PostgreSQL    │
│   Frontend      │◄──►│   Backend API   │◄──►│   Database      │
│   (React/TS)    │    │   (TypeScript)  │    │   (MikroORM)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   JWT Auth      │    │   Docker        │
│   Deployment    │    │   RBAC System   │    │   Development   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema Overview
- **Users**: Multi-role user system with role inheritance
- **Documents**: Metadata storage with cloud storage links (planned)
- **Shifts**: Hospital, preceptor, and student associations
- **Organizations**: Hospital and school management
- **Classes & Courses**: Academic structure management

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions per role
- **Hospital/School Scoping**: Data isolation based on organizational structure
- **Input Validation**: Comprehensive data validation and sanitization

## Development Setup

### Prerequisites
- Node.js 18+ or Bun runtime
- PostgreSQL database
- Docker (for local development)

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd PreceptoriaV2

# Backend setup
cd packages/elysia
bun install
cp env.example .env
# Configure your database credentials in .env
bun run dev

# Frontend setup
cd ../web
npm install
npm run dev
```

### Development Scripts
- `bun run dev`: Start development server with hot reload
- `bun run test`: Run test suite
- `bun run lint`: Code quality checks
- `bun run format`: Code formatting

## Lessons Learned

### Key Insights
- **Supervisor-First Approach**: Focusing on supervisor workflow first provides immediate value and validates the core concept
- **Role Flexibility**: The permission system needs to handle complex organizational hierarchies
- **Document Management**: Clear separation between document metadata and storage is essential
- **User Experience**: Supervisors need intuitive tools for managing multiple students efficiently

### Technical Decisions
- **Elysia.js**: Chosen for performance and TypeScript-first development
- **Next.js**: Selected for React ecosystem compatibility and deployment simplicity
- **PostgreSQL**: Robust relational database for complex permission relationships
- **JWT Authentication**: Stateless authentication suitable for distributed systems

## Conclusion

Preceptoria represents a modern approach to internship management, focusing on the supervisor workflow as the foundation for a comprehensive system. The current MVP provides the essential tools for document validation and management, with a clear roadmap for expanding to full student and administrative workflows.

The system's architecture prioritizes security, scalability, and user experience, making it suitable for both current needs and future growth. The focus on supervisor workflows ensures immediate value delivery while building the foundation for comprehensive internship management.


