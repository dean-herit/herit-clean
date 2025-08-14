# Herit - Irish Estate Planning Platform

> **Professional estate planning application** built with Next.js 14, JWT authentication, and Drizzle ORM.

Herit is a comprehensive legal-tech platform for creating and managing wills in Ireland, featuring OAuth authentication, identity verification, and digital signature capabilities.

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <repo-url> herit && cd herit
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your database URL and auth secrets

# 3. Start development
just dev
```

**That's it!** 🎉 Visit http://localhost:3000

## 🏗️ Architecture

This is a **Next.js 14 monorepo** with integrated authentication and database:

```
herit/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (auth, onboarding, etc.)
│   │   ├── (auth)/            # Auth-protected routes
│   │   └── (dashboard)/       # Dashboard routes  
│   ├── components/            # React components
│   ├── db/                    # Drizzle ORM schema + connection
│   ├── actions/               # Server actions
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utilities (auth, validation, etc.)
├── public/locales/            # i18n translations (en, de, fr-ca)
├── drizzle/                   # Database migrations
└── scripts/                   # Deployment and setup scripts
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 with App Router |
| **Database** | PostgreSQL + Drizzle ORM |
| **Authentication** | Custom JWT + Google OAuth |
| **Styling** | Tailwind CSS |
| **Validation** | Zod schemas |
| **Monitoring** | Sentry error tracking |
| **Deployment** | Vercel |
| **i18n** | Multi-language support |

## ⚡ Development Commands

| Command | Purpose |
|---------|---------|
| `just dev` | 🚀 **Start development server** |
| `just db-studio` | 🔍 **Open database management UI** |
| `just build` | 🏗️ **Production build** |
| `just typecheck` | 🔎 **TypeScript validation** |
| `just lint` | 🔍 **Code linting** |
| `just deploy` | 🚀 **Deploy to Vercel** |

[See all commands in justfile](#commands-reference)

## 🔧 Environment Setup

**Required variables:**
```bash
# Database
POSTGRES_URL=postgresql://...

# JWT Authentication  
SESSION_SECRET=your_jwt_secret_32_chars_min

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Sentry monitoring
SENTRY_DSN=your_sentry_dsn
```

## 🔐 Authentication System

### **JWT-Based Authentication**
- **Access tokens**: 15-minute JWT cookies (HTTP-only)
- **Refresh tokens**: 30-day rotating tokens with family tracking
- **Google OAuth**: Full PKCE flow implementation
- **Session management**: Server-side session validation

### **Security Features**
- HTTP-only secure cookies
- Argon2 password hashing  
- CSRF protection
- Token rotation on refresh
- Comprehensive audit logging

## 🎯 Core Features

### ✅ **Implemented Features**
- **Multi-step onboarding** (personal info, signatures, legal consent, verification)
- **Digital signature system** with audit trails
- **Asset management** (bank accounts, property, investments)
- **Beneficiary management** with inheritance rules
- **Will creation workflow** (draft/review/finalize)
- **Identity verification** (Stripe Identity integration)
- **Dashboard analytics** with estate overview
- **Multi-language support** (English, German, French-Canadian)

### 🔄 **Onboarding Flow**
1. **Personal Information** - Irish address validation with eircode
2. **Digital Signatures** - Canvas drawing or image upload
3. **Legal Consent** - Terms, privacy, and will creation agreements  
4. **Identity Verification** - Document upload and validation

### 📊 **Estate Planning**
- **Assets**: Categorized asset management with valuations
- **Beneficiaries**: Relationship tracking with inheritance percentages
- **Wills**: Template-based will generation with legal review
- **Audit Trail**: Complete activity logging for compliance

## 🗄️ Database Schema

### **Core Tables**
```sql
users              -- User profiles and onboarding status
assets            -- Financial and physical assets  
beneficiaries     -- Inheritance beneficiaries
wills             -- Will documents and versions
signatures        -- Digital signatures with metadata
signature_usage   -- Signature audit trail
audit_events      -- Comprehensive audit logging
refresh_tokens    -- JWT refresh token families
```

### **Key Features**
- **UUID primary keys** for security
- **Timestamp tracking** for all records
- **JSON fields** for flexible metadata
- **Foreign key constraints** with cascade deletes
- **Drizzle relations** for type-safe queries

## 🌐 Internationalization

**Supported Languages:**
- 🇬🇧 **English** (primary)
- 🇩🇪 **German** 
- 🇫🇷 **French (Canadian)**

**Translation Files:**
```
public/locales/{lang}/
├── auth.json         # Authentication pages
├── onboarding.json   # Onboarding flow
├── dashboard.json    # Dashboard interface
├── assets.json       # Asset management
├── beneficiaries.json # Beneficiary forms
├── will.json         # Will creation
└── common.json       # Shared translations
```

## 🚀 Deployment

### **Vercel Deployment**
```bash
# One-command deployment
just deploy

# Or manual deployment
vercel --prod
```

### **Environment Configuration**
- **Production database**: Vercel Postgres or Supabase
- **OAuth callbacks**: Configure redirect URIs in Google Console
- **Environment variables**: Set via Vercel dashboard

## 📋 Development Workflow

### **Getting Started**
1. **Setup environment**: `cp .env.example .env.local`
2. **Install dependencies**: `npm install`  
3. **Run migrations**: `just db-migrate`
4. **Start development**: `just dev`

### **Code Quality**
```bash
# Type checking
just typecheck

# Linting  
just lint

# Build validation
just build
```

### **Database Management**
```bash
# Open Drizzle Studio
just db-studio

# Generate migration
just db-generate  

# Run migrations
just db-migrate
```

## 🔍 API Routes

### **Authentication**
```
GET/POST /api/auth/session     # Session management
GET      /api/auth/google      # Google OAuth flow
POST     /api/auth/login       # Email/password login  
POST     /api/auth/logout      # Session termination
POST     /api/auth/refresh     # Token refresh
```

### **Onboarding**
```
POST /api/onboarding/personal-info      # Save personal details
POST /api/onboarding/signatures         # Create signatures
POST /api/onboarding/legal-consent      # Legal agreements
POST /api/onboarding/start-verification # Identity verification
GET  /api/onboarding/verification-status # Check verification
```

### **File Uploads**
```
POST /api/upload/profile-photo    # Profile image upload
POST /api/upload/signature-image  # Signature image upload
```

## 📁 Component Architecture

### **UI Components** (`src/components/ui/`)
```
button.tsx         # Primary button variants
forms/input.tsx    # Form input with validation
forms/select.tsx   # Dropdown select component
data-display/card.tsx # Content card wrapper
Header.tsx         # Navigation header
BackgroundLayout.tsx # Page background wrapper
```

### **Feature Components**
```
auth/              # Authentication forms
├── LoginForm.tsx
├── EmailLoginForm.tsx  
├── EmailSignupForm.tsx
└── GoogleSignInButton.tsx

estate-planning/   # Estate planning features
├── AssetForm.tsx
└── BeneficiaryForm.tsx

dashboard/         # Dashboard components  
└── DashboardLayout.tsx
```

### **Onboarding Components**
```
onboarding/components/
├── ProgressSteps.tsx      # Step progress indicator
├── PersonalInfoStep.tsx   # Personal information form
├── SignatureStep.tsx      # Digital signature creation
├── LegalConsentStep.tsx   # Legal agreements
└── VerificationStep.tsx   # Identity verification
```

## 🛡️ Security & Compliance

### **Security Measures**
- **JWT tokens** stored in HTTP-only cookies
- **Argon2 password hashing** with secure parameters
- **Input validation** with Zod schemas
- **SQL injection prevention** via Drizzle ORM
- **CSRF protection** on state-changing operations
- **Security headers** configured via Next.js

### **Compliance Features**
- **Audit logging** for all sensitive operations
- **Data retention** policies via database constraints
- **GDPR compliance** ready for EU users
- **Legal document** versioning and hash verification

## 📞 Support & Commands Reference

### **All Available Commands**
```bash
# Development
just dev              # Start development server
just build            # Production build
just typecheck        # TypeScript checking
just lint             # Code linting

# Database  
just db-studio        # Open database UI
just db-generate      # Create migration
just db-migrate       # Run migrations  
just db-push          # Push schema changes

# Deployment
just deploy           # Deploy to Vercel
just setup-vercel     # Configure Vercel env

# Utilities
just status           # Project health check
just check-env        # Validate environment
just help             # Show all commands
```

### **Troubleshooting**
- **Authentication issues**: Check Google OAuth configuration
- **Database connection**: Verify POSTGRES_URL environment variable
- **Build failures**: Run `just typecheck` to identify TypeScript errors
- **JWT errors**: Ensure SESSION_SECRET is set and 32+ characters

---

**Built with ❤️ for the Irish legal system using modern, secure web technologies.**