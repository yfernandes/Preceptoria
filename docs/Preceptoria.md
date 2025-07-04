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

The system implements granular permissions designed to prevent accidental cross-referencing of data:

#### SysAdmin
- Full system access (`*:*:*`)
- Complete administrative control

#### OrgAdmin
- **Organization-Wide Management**: Access to all resources within their organization using `*_Managed` permissions
- **Operational Manager Creation**: Can create and manage Supervisors, HospitalManagers, and Preceptors
- **Audit Access**: Can access logs and delete historical data (compliance requirement)
- **Data Isolation**: Cannot access resources from other organizations

#### Supervisor (MVP Focus)
- **Academic Resources**: Manage courses, classes, students within their school using `*_Own` permissions
- **Cross-Hospital Shift Management**: Create and manage shifts across hospitals, assign students and preceptors
- **Student Document Management**: Upload, read, update, delete documents on behalf of students using `*_Students` permissions
- **Document Compilation**: Compile student documents into bundles for hospital approval
- **Limited Cross-Organization Access**: Basic hospital info for shift creation using `Read_Basic` permissions
- **Class-Level Data Access**: Can see other students in their classes using `Read_Class` permissions

#### HospitalManager
- **Hospital Operations**: Manage their hospital data using `*_Own` permissions
- **Shift Oversight**: Read shifts assigned to their hospital using `Read_Managed` permissions
- **Document Approval**: Read and approve/reject document bundles using `Approve_Bundle` permissions
- **Student/Class Info**: Basic access to student and class information for shifts at their hospital
- **Data Isolation**: Cannot access data from other hospitals

#### Preceptor
- **Assigned Shift Management**: Read and update shifts they're assigned to using `*_Assigned` permissions
- **Teaching Context**: Basic access to student and hospital information for their teaching context
- **Data Isolation**: Cannot access shifts they're not assigned to

#### Student
- **Personal Document Management**: Create, read, update, delete their own documents using `*_Own` permissions
- **Academic Access**: Read access to their classes and shifts using `Read_Own` permissions
- **Cross-Organization Navigation**: Basic hospital info for navigation using `Read_Basic` permissions
- **Classmate Visibility**: Can see other students in their class using `Read_Class` permissions
- **Data Isolation**: Cannot access documents or data from other students

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
- **Role-Based Access Control**: Granular permissions per role with data isolation
- **Hospital/School Scoping**: Data isolation based on organizational structure
- **Cross-Organization Access Control**: Limited access to prevent accidental data cross-referencing
- **Class-Level Isolation**: Students can only access data within their class
- **Input Validation**: Comprehensive data validation and sanitization
- **Audit Logging**: Hierarchical log access with compliance requirements

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


