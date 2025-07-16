# Technology Stack & Planning

## Current Technology Stack

### Core Technologies
- **Runtime:** Bun 🍞 - Fast JavaScript runtime for development and production
- **Language:** TypeScript - Type-safe development across the entire stack
- **Architecture:** Monorepo - Shared packages and configurations

### Backend Stack
- **Framework:** Elysia.js - High-performance TypeScript-first web framework
- **Database:** PostgreSQL with MikroORM for type-safe database operations
- **Authentication:** JWT with role-based access control and token rotation
- **Security:** HTTP-only cookies, CORS protection, comprehensive input validation

### Frontend Stack
- **Framework:** Next.js 15 with App Router
- **UI Library:** React 19 with TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui components
- **API Client:** Eden Treaty for end-to-end type safety
- **Components:** Radix UI primitives for accessibility

### Development Tools
- **Testing:** Bun Test with 95%+ coverage
- **Code Quality:** ESLint + Prettier + EditorConfig
- **Database:** Drizzle Studio for development browsing

## Architecture Decisions

### Monorepo Structure

```
PreceptoriaV2/
├── apps/
│   ├── api/          # Elysia.js backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── config/       # Shared configurations
│   ├── libs/         # Shared utilities
│   └── ui/           # Shared UI components
└── docs/             # Documentation
```

### Type Safety Strategy

- **Eden Treaty** for end-to-end type safety between frontend and backend
- **Direct API coupling** instead of premature abstraction
- **Shared type definitions** through monorepo path aliases
- **No redundant type wrappers** - let Eden Treaty handle type inference

### API Client Architecture

```typescript
// Direct Eden Treaty usage (no unnecessary wrappers)
import { App } from "@api";
import { treaty } from "@elysiajs/eden";

export const api = treaty<App>("http://localhost:3000");

// Usage with full type safety
const response = await api.auth.signin.post({ email, password });
```

### Path Aliases

- **@api** → Backend API types and exports
- **@web** → Frontend source code
- **@libs** → Shared utilities
- **@ui** → Shared UI components

## Development Environment

### Local Setup

```bash
# Install dependencies (from root)
bun install

# Backend (Elysia.js)
cd apps/api
bun run dev

# Frontend (Next.js)
cd apps/web
bun run dev
```

### Database

- **Local Development**: PostgreSQL in Docker
- **Production**: Managed PostgreSQL service (TBD)

## Key Architectural Principles

### 1. Type Safety First

- Full end-to-end type safety with Eden Treaty
- No manual type definitions for API responses
- Compile-time error detection for API changes

### 2. Minimal Abstraction

- Avoid premature abstraction and over-engineering
- Direct API usage with Eden Treaty
- Extract patterns only when they repeat 3+ times

### 3. Monorepo Benefits

- Shared dependencies and configurations
- Single source of truth for types
- Consistent development experience

### 4. Progressive Enhancement

- Start simple, add complexity as needed
- Domain-driven design can be added later
- Focus on building features, not perfect architecture

## Future Technology Roadmap

### Planned Enhancements

#### Authentication & Security

- **Social Authentication**: Google OAuth integration
- **Multi-Factor Authentication (MFA)**: Additional security layer
- **Rate Limiting**: Protection against abuse
- **Audit Logging**: Comprehensive activity tracking

#### Storage & File Management

- **GCP Cloud Storage**: Document storage for 900+ existing documents
- **File Processing**: Document validation and processing
- **CDN Integration**: Fast document delivery

#### Real-time Features

- **WebSocket Support**: Real-time notifications and updates
- **Server-Sent Events**: Live data updates
- **Push Notifications**: Browser and mobile notifications

#### Advanced Features

- **Search Engine**: Full-text search across documents and entities
- **PDF Generation**: Report and document generation
- **Email Integration**: Automated email notifications
- **WhatsApp Integration**: High-priority notifications

### Technology Considerations

#### Search Solutions

- **Fuse.js** - Client-side fuzzy search
- **Minisearch** - Lightweight search engine
- **PostgreSQL Full-Text Search** - Database-level search
- **Elasticsearch** - Advanced search capabilities (future)

#### Email Services

- **SendGrid** - Reliable email delivery
- **Resend** - Modern email API
- **AWS SES** - Cost-effective email service
- **Postmark** - Transactional email focus

#### PDF Generation

- **Puppeteer** - HTML to PDF conversion
- **jsPDF** - Client-side PDF generation
- **PDFKit** - Server-side PDF creation
- **React-PDF** - React-based PDF generation

#### Monitoring & Analytics

- **OpenTelemetry** - Application monitoring
- **Sentry** - Error tracking and performance monitoring
- **Google Analytics** - User behavior tracking
- **Custom Analytics** - Business-specific metrics

## Deployment Strategy

### Current Plan

- **Frontend**: Vercel deployment
- **Backend**: Vercel Functions or Railway
- **Database**: Managed PostgreSQL service
- **Storage**: GCP Cloud Storage

### Alternative Options

- **Railway** - Full-stack deployment platform
- **Render** - Simple deployment with PostgreSQL
- **DigitalOcean** - Self-managed infrastructure
- **AWS** - Enterprise-grade cloud services

## Performance Considerations

### Backend Optimization

- **Connection Pooling** - Database connection management
- **Caching Strategy** - Redis for frequently accessed data
- **Query Optimization** - Efficient database queries
- **Load Balancing** - Horizontal scaling preparation

### Frontend Optimization

- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Next.js built-in optimization
- **Bundle Analysis** - Webpack bundle optimization
- **CDN Integration** - Global content delivery

## Security Measures

### Current Implementation

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - Granular permissions
- **Input Validation** - Request sanitization
- **CORS Protection** - Cross-origin security

### Planned Security Enhancements

- **HTTPS Enforcement** - Secure communication
- **Rate Limiting** - Abuse prevention
- **Security Headers** - Additional protection layers
- **Regular Security Audits** - Ongoing security review

## Testing Strategy

### Current Testing

- **Unit Tests** - Bun test framework
- **Integration Tests** - API endpoint testing
- **Permission Tests** - RBAC validation

### Planned Testing

- **End-to-End Tests** - Full user workflow testing
- **Performance Tests** - Load and stress testing
- **Security Tests** - Vulnerability assessment
- **Accessibility Tests** - WCAG compliance

## Migration Strategy

### Google Forms Migration

- **Data Extraction** - Export existing 900+ documents
- **Data Validation** - Clean and validate imported data
- **Document Processing** - Convert to new system format
- **User Onboarding** - Gradual migration of users

### Database Migrations

- **Schema Evolution** - MikroORM migration system
- **Data Migration** - Safe data transformation
- **Rollback Strategy** - Emergency rollback procedures
- **Backup Strategy** - Regular data backups

## Cost Optimization

### Development Costs

- **Free Tier Services** - Leverage free tiers during development
- **Local Development** - Docker-based local environment
- **Open Source Tools** - Minimize licensing costs

### Production Costs

- **Vercel Hobby Plan** - Free tier for MVP
- **Managed Database** - Cost-effective PostgreSQL hosting
- **GCP Storage** - Pay-per-use document storage
- **CDN Optimization** - Reduce bandwidth costs

## Portfolio Considerations

### Technology Showcase

- **Modern Stack** - Next.js, TypeScript, Elysia.js
- **Best Practices** - Clean architecture, testing, documentation
- **Performance** - Optimized for speed and efficiency
- **Scalability** - Designed for growth
- **Type Safety** - End-to-end type safety with Eden Treaty
