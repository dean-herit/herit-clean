# Herit Legacy Code Reference Archive
*Created: 2025-08-14*

This document serves as a comprehensive reference for all functionality implemented in the original Herit project before migration to the clean architecture. Use this as a specification for re-implementing features in the new codebase.

## Table of Contents
1. [UI Pages & Routes](#ui-pages--routes)
2. [Components Architecture](#components-architecture)
3. [API Endpoints](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication-system)
6. [Business Logic Workflows](#business-logic-workflows)
7. [Third-Party Integrations](#third-party-integrations)

---

## UI Pages & Routes

### Core Application Pages
- **`/`** - Landing/Home page
- **`/dashboard`** - Main user dashboard
- **`/profile`** - User profile management
- **`/onboarding`** - Multi-step onboarding flow
- **`/onboarding/verification-callback`** - Identity verification callback

### Estate Planning Features
- **`/assets`** - Asset management dashboard
- **`/assets/create`** - Add new asset form
- **`/beneficiaries`** - Beneficiary management
- **`/beneficiaries/create`** - Add beneficiary form
- **`/will`** - Will dashboard
- **`/will/create`** - Will creation wizard
- **`/will-preview`** - Will document preview

### Authentication Flow
- **`/auth/callback`** - OAuth callback handler
- **`/auth/error`** - Authentication error page

### Witness & Agent Features
- **`/witness`** - Witness dashboard
- **`/witness/profile`** - Witness profile management
- **`/witness/schedule`** - Appointment scheduling
- **`/agent`** - Agent dashboard
- **`/agent/clients/create`** - Create new client

### Development/Demo
- **`/signature-demo`** - Digital signature demonstration

---

## Components Architecture

### Core UI Components (`/src/components/ui/`)
```typescript
// Base UI Components
Button.tsx          // Primary button component with variants
Input.tsx           // Form input with validation
Card.tsx           // Content card wrapper
Modal.tsx          // Modal dialog component
Alert.tsx          // Alert/notification component
Badge.tsx          // Status badge component
ProgressBar.tsx    // Progress indicator
DarkModeSwitch.tsx // Theme toggle
```

### Authentication Components (`/src/components/auth/`)
```typescript
KindeAuthProvider.tsx   // Main auth provider wrapper
ProtectedRoute.tsx      // Route protection HOC
OnboardingGuard.tsx     // Onboarding completion check
LoginForm.tsx           // Generic login form
EmailLoginForm.tsx      // Email-specific login
EmailSignupForm.tsx     // Email registration
GoogleSignInButton.tsx  // Google OAuth button
AppleSignInButton.tsx   // Apple Sign In button
```

### Signature System (`/src/components/signature/`)
```typescript
SignatureCanvas.tsx         // Canvas for drawing signatures
SignatureManager.tsx        // Signature CRUD operations
SignaturePickerModal.tsx    // Signature selection modal
SignatureTemplateSelector.tsx // Pre-built signature templates
SignatureStamp.tsx          // Signature placement/stamping
SignatureLegalConsent.tsx   // Legal consent for signatures
```

### Form Components (`/src/components/forms/`)
```typescript
FormField.tsx     // Generic form field wrapper
CopyFormField.tsx // Copy-enabled form field
```

### Image Management (`/src/components/images/`)
```typescript
OptimizedImage.tsx          // Next.js optimized image wrapper
ImageUpload.tsx             // File upload component
ImageGallery.tsx            // Gallery display
ImagePerformanceMonitor.tsx // Performance tracking
```

### Layout & Navigation
```typescript
DashboardLayout.tsx    // Main dashboard layout
ClientApp.tsx          // Client-side app wrapper
ClientOnlyWrapper.tsx  // Hydration wrapper
NoSSR.tsx             // Disable SSR for components
```

### Error Handling
```typescript
ErrorBoundary.tsx          // React error boundary
GlobalErrorHandler.tsx     // Global error management
ErrorNotification.tsx      // Error display component
```

### Debug & Development
```typescript
AuthDebug.tsx       // Authentication debug panel
CacheDebug.tsx      // Cache inspection tool
MemoryDebug.tsx     // Memory leak detection
BuildBanner.tsx     // Development build indicator
```

### Providers & Context
```typescript
QueryProvider.tsx         // React Query provider
ServiceWorkerProvider.tsx // PWA service worker
DynamicRoutes.tsx        // Dynamic routing
```

---

## API Endpoints

### Authentication Endpoints
```typescript
// JWT-based Authentication System
GET    /api/auth/session           // Get current session
POST   /api/auth/session           // Update session
GET    /api/auth/providers         // List available providers
GET    /api/auth/[action]          // Dynamic auth actions
POST   /api/auth/refresh           // Refresh JWT token

// OAuth Provider Integration
GET    /api/auth/google/authorize   // Google OAuth flow
GET    /api/auth/apple/authorize    // Apple Sign In flow
POST   /api/auth/callback/[provider] // OAuth callbacks

// Email Authentication
POST   /api/auth/email/login        // Email/password login
POST   /api/auth/email/signup       // Email registration

// Proxy to Backend
POST   /api/proxy/[...path]         // Backend API proxy
```

### Backend API Endpoints (FastAPI)
```python
# Health & Status
GET    /                          # Root health check
GET    /health                    # Service health
GET    /api/v1/health            # API health
GET    /api/health/db            # Database health

# User Management
POST   /api/v1/auth/sync-user    # Sync user from auth provider
GET    /api/v1/admin/user/{email} # Get user by email
GET    /users/by-email/{email}   # Legacy user lookup
POST   /users                    # Create user
GET    /api/v1/admin/users       # List all users
DELETE /api/v1/admin/cleanup-test-users # Test cleanup

# Onboarding Flow
POST   /api/v1/onboarding/personal-info    # Save personal info
POST   /api/v1/onboarding/legal-consent    # Save legal consent
POST   /api/v1/onboarding/complete         # Complete onboarding
GET    /api/v1/onboarding/status           # Get onboarding status
GET    /api/v1/onboarding/personal-info    # Get personal info
GET    /api/v1/onboarding/legal-consent    # Get consent status
GET    /api/v1/onboarding/legal-disclaimers # Get disclaimers

# Identity Verification (Stripe)
POST   /api/v1/onboarding/verification/start    # Start verification
GET    /api/v1/onboarding/verification/status   # Check status
POST   /api/v1/onboarding/verification/callback # Callback handler
POST   /api/webhooks/stripe/identity            # Stripe webhooks
GET    /api/v1/debug/verification-sessions      # Debug sessions
POST   /api/v1/admin/reset-verification         # Reset verification

# Asset Management
GET    /api/v1/assets             # List user assets
POST   /api/v1/assets             # Create new asset
GET    /api/v1/assets/{asset_id}  # Get specific asset
PUT    /api/v1/assets/{asset_id}  # Update asset
DELETE /api/v1/assets/{asset_id}  # Delete asset

# Beneficiary Management  
GET    /api/v1/heirs              # List beneficiaries (legacy name)
POST   /api/v1/heirs              # Create beneficiary
GET    /api/v1/heirs/{heir_id}    # Get beneficiary
PUT    /api/v1/heirs/{heir_id}    # Update beneficiary
DELETE /api/v1/heirs/{heir_id}    # Delete beneficiary

# Will Creation
GET    /api/v1/will-creation/progress  # Get will progress
POST   /api/v1/will-creation           # Create will
GET    /api/v1/will-creation/archived  # Get archived wills
PUT    /api/v1/will-creation/{will_id} # Update will

# Digital Signatures
GET    /api/signatures/health                    # Signature service health
POST   /api/signatures                          # Create signature
GET    /api/signatures                          # List signatures
GET    /api/signatures/{signature_id}           # Get signature
PATCH  /api/signatures/{signature_id}           # Update signature
DELETE /api/signatures/{signature_id}           # Delete signature
POST   /api/signatures/{signature_id}/usage     # Record usage
GET    /api/signatures/{signature_id}/usage     # Get usage history
POST   /api/signatures/{signature_id}/last-used # Update last used
GET    /api/signatures/usage                    # Global usage stats

# Audit Trail
POST   /api/audit/events          # Create audit event

# Admin & Debug
POST   /api/admin/force-init-db   # Initialize database
POST   /api/admin/migrate-database # Run migrations
GET    /api/v1/debug/database-status # Database debug
GET    /api/v1/debug/stripe-config   # Stripe config debug
POST   /api/v1/debug/stripe-test     # Test Stripe integration

# Persona Integration (Alternative KYC)
POST   /api/webhooks/persona      # Persona webhook handler
GET    /api/webhooks/persona/test # Test Persona webhook
```

---

## Database Schema

### Core User Model
```sql
-- users table
CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,        -- Primary identifier
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(50),
    date_of_birth VARCHAR(50),            -- Stored as string
    
    -- Address fields
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    county VARCHAR(100),
    eircode VARCHAR(20),
    
    -- Onboarding tracking
    onboarding_status VARCHAR(50) DEFAULT 'not_started',
    onboarding_current_step VARCHAR(50) DEFAULT 'personal_info',
    onboarding_completed_at TIMESTAMP,
    
    -- Step completion flags
    personal_info_completed BOOLEAN DEFAULT FALSE,
    personal_info_completed_at TIMESTAMP,
    signature_completed BOOLEAN DEFAULT FALSE,
    signature_completed_at TIMESTAMP,
    legal_consent_completed BOOLEAN DEFAULT FALSE,
    legal_consent_completed_at TIMESTAMP,
    legal_consents JSON,                   -- Consent details
    
    -- Identity verification
    verification_completed BOOLEAN DEFAULT FALSE,
    verification_completed_at TIMESTAMP,
    verification_session_id VARCHAR(255),
    verification_status VARCHAR(50),
    
    -- Authentication
    kinde_id VARCHAR(255) UNIQUE,          -- Legacy Kinde ID
    auth_provider VARCHAR(50),             -- 'email', 'google', 'apple', 'kinde'
    auth_provider_id VARCHAR(255),         -- Provider-specific ID
    password_hash VARCHAR(255),            -- For email auth
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Asset Management
```sql
-- assets table
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) REFERENCES users(email),
    
    -- Asset details
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,      -- 'bank_account', 'property', 'investment'
    value FLOAT NOT NULL DEFAULT 0.0,
    description TEXT,
    
    -- Type-specific fields
    account_number VARCHAR(255),           -- For bank accounts
    bank_name VARCHAR(255),
    property_address TEXT,                 -- For real estate
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',   -- 'active', 'inactive', 'disposed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Beneficiary System
```sql
-- beneficiaries table
CREATE TABLE beneficiaries (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) REFERENCES users(email),
    
    -- Beneficiary details
    name VARCHAR(255) NOT NULL,
    relationship_type VARCHAR(100) NOT NULL,  -- 'spouse', 'child', 'friend', 'charity'
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Address
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    county VARCHAR(100),
    eircode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Ireland',
    
    -- Inheritance details
    percentage FLOAT,                      -- Percentage of estate
    specific_assets JSON,                  -- List of specific asset IDs
    conditions TEXT,                       -- Special conditions
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Will Documents
```sql
-- wills table
CREATE TABLE wills (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) REFERENCES users(email),
    
    -- Will metadata
    title VARCHAR(255) NOT NULL DEFAULT 'Last Will and Testament',
    will_type VARCHAR(100) DEFAULT 'simple',
    
    -- Content
    content TEXT,                          -- Generated will content
    preferences JSON,                      -- User preferences
    
    -- Legal status
    status VARCHAR(50) DEFAULT 'draft',    -- 'draft', 'reviewed', 'finalized'
    legal_review_status VARCHAR(50),       -- 'pending', 'approved', 'requires_changes'
    legal_reviewer VARCHAR(255),
    
    -- Document management
    document_hash VARCHAR(255),            -- Hash of final document
    document_url VARCHAR(500),             -- Storage URL
    version INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalized_at TIMESTAMP
);
```

### Digital Signature System
```sql
-- signatures table
CREATE TABLE signatures (
    id VARCHAR(255) PRIMARY KEY,          -- Format: sig_timestamp_random
    user_email VARCHAR(255) REFERENCES users(email),
    
    -- Signature details
    name VARCHAR(255) NOT NULL,           -- User-defined name
    signature_type VARCHAR(50) NOT NULL,  -- 'drawn' or 'uploaded'
    data TEXT NOT NULL,                   -- Base64 encoded image
    hash VARCHAR(255) NOT NULL,           -- SHA-256 hash for integrity
    signature_metadata JSON,              -- Width, height, mime type
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP
);

-- signature_usage table (audit trail)
CREATE TABLE signature_usage (
    id SERIAL PRIMARY KEY,
    signature_id VARCHAR(255) REFERENCES signatures(id),
    user_email VARCHAR(255) REFERENCES users(email),
    
    -- Usage context
    document_type VARCHAR(100) NOT NULL,  -- 'onboarding', 'will', 'beneficiary_form'
    document_id VARCHAR(255),
    
    -- Placement coordinates
    location_x INTEGER,
    location_y INTEGER,
    location_width INTEGER,
    location_height INTEGER,
    
    -- Audit information
    ip_address VARCHAR(45),               -- IPv4 or IPv6
    user_agent TEXT,
    session_id VARCHAR(255),
    
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### OAuth & Authentication
```sql
-- oauth_providers table
CREATE TABLE oauth_providers (
    id VARCHAR(50) PRIMARY KEY,           -- 'google', 'apple', etc.
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    icon_url VARCHAR(500),
    
    -- OAuth endpoints
    authorization_url VARCHAR(500) NOT NULL,
    token_url VARCHAR(500) NOT NULL,
    userinfo_url VARCHAR(500),
    revoke_url VARCHAR(500),
    
    -- Configuration
    client_id VARCHAR(255) NOT NULL,
    client_secret TEXT,                   -- Not used for Apple
    scopes JSON DEFAULT '["openid", "profile", "email"]',
    config JSON,                          -- Provider-specific config
    
    -- Status
    enabled BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- user_oauth_accounts table
CREATE TABLE user_oauth_accounts (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) REFERENCES users(email),
    provider_id VARCHAR(50) REFERENCES oauth_providers(id),
    
    -- Provider account details
    provider_user_id VARCHAR(255) NOT NULL,
    provider_username VARCHAR(255),
    provider_email VARCHAR(255),
    
    -- User profile from provider
    display_name VARCHAR(255),
    given_name VARCHAR(100),
    family_name VARCHAR(100),
    picture_url VARCHAR(500),
    
    -- OAuth tokens (encrypted in production)
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    token_expires_at TIMESTAMP,
    
    -- Account metadata
    account_metadata JSON,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- oauth_states table (PKCE flow)
CREATE TABLE oauth_states (
    id VARCHAR(255) PRIMARY KEY,          -- OAuth state parameter
    provider_id VARCHAR(50) REFERENCES oauth_providers(id),
    
    -- PKCE data
    code_verifier VARCHAR(255) NOT NULL,
    code_challenge VARCHAR(255) NOT NULL,
    nonce VARCHAR(255),
    redirect_uri VARCHAR(500) NOT NULL,
    
    -- Session context
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Expiry
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audit System
```sql
-- audit_events table
CREATE TABLE audit_events (
    id VARCHAR(255) PRIMARY KEY,          -- audit_timestamp_random
    user_email VARCHAR(255) REFERENCES users(email),
    
    -- Event details
    action VARCHAR(100) NOT NULL,         -- 'signature_created', 'signature_used'
    entity_type VARCHAR(50) NOT NULL,     -- 'signature', 'document'
    entity_id VARCHAR(255) NOT NULL,
    
    -- Event metadata
    event_metadata JSON,
    
    -- Audit context
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Authentication System

### JWT Implementation
```typescript
// JWT Token Structure
interface JWTPayload {
  sub: string;           // User identifier (email)
  email: string;         // User email
  name: string;          // Display name
  given_name?: string;   // First name
  family_name?: string;  // Last name
  picture?: string;      // Profile picture URL
  provider: string;      // Auth provider ('kinde', 'google', 'apple', 'email')
  iat: number;          // Issued at
  exp: number;          // Expires at
}

// Cookie Configuration
{
  name: 'auth-token',
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
}
```

### OAuth Flow Architecture
```typescript
// Google OAuth Flow
1. GET /api/auth/google/authorize
   - Generate PKCE parameters
   - Store state in database
   - Redirect to Google

2. POST /api/auth/callback/google
   - Validate state parameter
   - Exchange code for tokens
   - Fetch user profile
   - Create/update user record
   - Issue JWT token
   - Set HTTP-only cookie

// Apple Sign In Flow
1. GET /api/auth/apple/authorize
   - Generate client secret JWT
   - Create authorization URL
   - Store PKCE state
   - Redirect to Apple

2. POST /api/auth/callback/apple
   - Validate ID token
   - Extract user information
   - Handle name/email scope
   - Create user session
```

### Email Authentication
```typescript
// Registration Flow
POST /api/auth/email/signup
{
  email: string,
  password: string,
  firstName: string,
  lastName: string
}

// Login Flow
POST /api/auth/email/login
{
  email: string,
  password: string
}

// Password hashing: bcrypt with 12 rounds
```

---

## Business Logic Workflows

### Onboarding Flow
```typescript
// 4-Step Onboarding Process
1. Personal Information
   - Name, phone, date of birth
   - Full address including eircode
   - Validation with Irish address format

2. Digital Signature Creation
   - Canvas-based signature drawing
   - Signature template selection
   - Multiple signature storage

3. Legal Consent & Disclaimers
   - Terms of service agreement
   - Privacy policy consent
   - Will creation legal disclaimers
   - GDPR compliance consent

4. Identity Verification
   - Stripe Identity integration
   - Document upload and verification
   - Webhook-based status updates
   - Alternative: Persona KYC integration
```

### Estate Planning Workflow
```typescript
// Asset Management
1. Asset Categories
   - Bank accounts (account number, bank name)
   - Real estate (address, valuation)
   - Investments (portfolio details)
   - Personal property (description, value)

2. Asset Valuation
   - Manual value entry
   - Currency formatting (EUR)
   - Update tracking and history

// Beneficiary Management
1. Beneficiary Types
   - Individual beneficiaries
   - Charitable organizations
   - Trust entities

2. Inheritance Distribution
   - Percentage-based distribution
   - Specific asset allocation
   - Conditional inheritance rules
   - Backup beneficiary system

// Will Generation
1. Will Templates
   - Simple will structure
   - Complex estate planning
   - Trust-based wills
   - Charitable giving provisions

2. Legal Review Process
   - Draft creation
   - Legal professional review
   - Client approval workflow
   - Final document generation
```

### Digital Signature Workflow
```typescript
// Signature Creation
1. Signature Methods
   - Canvas drawing with touch/mouse
   - Image upload
   - Template-based generation
   - Font-based signatures

2. Signature Management
   - Multiple signatures per user
   - Signature naming and organization
   - Usage tracking and audit

3. Document Signing
   - Signature placement on documents
   - Legal consent verification
   - Audit trail creation
   - Tamper-proof hash generation
```

---

## Third-Party Integrations

### Stripe Identity Verification
```typescript
// Integration Configuration
- Product: Stripe Identity
- Verification types: ID document + selfie
- Supported documents: Irish passport, driving license, national ID
- Webhook events: created, processing, verified, requires_input, canceled

// Webhook Handler
POST /api/webhooks/stripe/identity
- Signature verification with webhook secret
- User session updates
- Database status synchronization
- Email notifications for status changes

// Session Management
- Server-side session storage
- User ID mapping through metadata
- Status polling for real-time updates
- Error handling and retry logic
```

### Persona KYC (Alternative)
```typescript
// Integration Configuration  
- Alternative to Stripe Identity
- More comprehensive KYC checks
- European compliance focus
- Webhook-based status updates

// Implementation
POST /api/webhooks/persona
- Inquiry status tracking
- Document verification results
- Risk assessment integration
- Compliance reporting
```

### Kinde Authentication (Legacy)
```typescript
// Legacy Integration
- OAuth 2.0 + PKCE flow
- User management and profiles
- Multi-tenant architecture support
- Migration path to JWT-based auth

// Current Status: Migrated to JWT
- Maintained for backward compatibility
- User records include kinde_id field
- Gradual migration to provider-agnostic auth
```

### Email Service Integration
```typescript
// Email Configuration
- Service: Not specified in legacy code
- Use case: Verification status notifications
- Template system: Not implemented
- Internationalization: Ready for i18n integration

// Implementation Requirements
- Transactional email service
- Template management
- Multi-language support
- Delivery tracking and analytics
```

---

## Key Libraries & Dependencies

### Frontend Core
```json
{
  "next": "14.x",                    // Next.js framework
  "react": "18.x",                   // React library
  "@tanstack/react-query": "^5.x",   // Data fetching
  "jose": "^5.x",                    // JWT handling
  "tailwindcss": "^3.x",             // Styling
  "framer-motion": "^x.x",           // Animations
  "react-i18next": "^x.x",           // Internationalization
  "canvas": "signature drawing",      // Signature canvas
  "bcryptjs": "password hashing"     // Client-side password utilities
}
```

### Backend Core  
```python
{
  "fastapi": "^0.104.1",           # FastAPI framework
  "sqlalchemy": "^2.0.23",        # ORM and database
  "stripe": "^7.x",               # Stripe Identity integration
  "python-jose[cryptography]": "JWT handling",
  "bcrypt": "password hashing",    # Secure password storage
  "python-multipart": "form handling",
  "uvicorn": "ASGI server"         # Production server
}
```

### Development & Build Tools
```json
{
  "eslint": "code linting",
  "typescript": "type safety",
  "jest": "testing framework",
  "playwright": "e2e testing",
  "docker": "containerization",
  "turbo": "monorepo management"
}
```

---

## Migration Notes

### Critical Features to Reimplement
1. **Multi-step onboarding with progress tracking**
2. **Digital signature system with audit trail**
3. **Identity verification integration**
4. **Estate planning data models**
5. **JWT-based authentication system**
6. **Multi-language support (en, de, fr-ca)**
7. **OAuth provider integrations**

### Security Considerations
- All JWT tokens must be HTTP-only cookies
- CSRF protection on state-changing operations
- Rate limiting on authentication endpoints
- Audit logging for sensitive operations
- Input validation and sanitization
- SQL injection prevention through ORM

### Performance Optimizations
- Image optimization for signature storage
- Database connection pooling
- Query optimization for large datasets
- Caching strategy for frequently accessed data
- Bundle size optimization for client-side code

### Compliance Requirements  
- GDPR compliance for EU users
- Data retention policies
- Right to be forgotten implementation
- Audit trail for legal compliance
- Secure document storage

---

*This archive documents the complete functionality of the legacy Herit application as of 2025-08-14. Use this as a comprehensive specification for rebuilding features in the new clean architecture.*