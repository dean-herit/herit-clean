# Claude Directives for Herit Project

## Quick Orientation (Start Here!)

### What is Herit?
**Herit** is a legal-tech platform for creating and managing wills with OAuth authentication, identity verification (KYC), and estate planning features. It's a **Docker-first** application with strict validation requirements.

### Current Architecture (As of 2025)
```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│                 │────▶│                  │────▶│              │
│  Frontend       │     │  Backend API     │     │  PostgreSQL  │
│  (Next.js 14)   │◀────│  (FastAPI)       │◀────│  Database    │
│  + OAuth Auth   │     │  ISOLATED        │     │  (Supabase)  │
│  Vercel App     │     │  Python Service  │     │              │
└─────────────────┘     └──────────────────┘     └──────────────┘
   Frontend Project        Backend Project        Database
```

**ARCHITECTURE CHANGE (Jan 2025)**: Backend and frontend are now **completely independent projects**:

- **Frontend**: Monorepo deployment with Next.js + JWT auth via API routes
- **Backend**: Isolated Python serverless function deployment (no Node.js/npm dependencies)
- **Communication**: Frontend proxy routes API calls to isolated backend
- **Deployment**: Separate Vercel projects with independent scaling and deployments

### Quick Start Commands (January 2025)

#### First-Time Setup (REQUIRED)
```bash
# 1. Copy the environment template
cp .env.example .env.local

# 2. Edit .env.local with required values:
# - POSTGRES_URL: PostgreSQL connection string (Supabase/Vercel Postgres)
# - SESSION_SECRET: Generate with: openssl rand -hex 32
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET: OAuth credentials
# - BLOB_READ_WRITE_TOKEN: Vercel Blob storage token (for file uploads)

# 3. Optional: Set up Stripe Identity (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY)
```

#### Vercel Blob Storage Setup (Required for File Uploads)
```bash
# 1. Install Vercel CLI (if not already installed)
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Create a Blob store (from project root)
vercel blob create

# 4. Get the read-write token
vercel blob ls --token

# 5. Add BLOB_READ_WRITE_TOKEN to your .env.local file
echo "BLOB_READ_WRITE_TOKEN=vercel_blob_rw_..." >> .env.local
```

#### Daily Development
```bash
# NEW: Start Vercel-matched local development (RECOMMENDED)
just dev-local

# Legacy: Start Docker containers (deprecated due to production mismatch)  
just dev

# Check if everything is working
just validate

# Stop everything
just down          # Docker only
# For local development, use Ctrl+C to stop dev-local
```

## Key Project Files Reference

### For Authentication Issues
- `/frontend/src/app/api/auth/google/route.ts` - Google OAuth implementation
- `/frontend/src/lib/jwt.ts` - JWT token utilities and configuration
- `/frontend/src/lib/auth-cookies.ts` - JWT cookie management
- `/frontend/src/hooks/useAuth.ts` - Primary authentication hook
- `/frontend/src/app/api/auth/session/route.ts` - JWT session management
### For Frontend Work
- `/frontend/src/app/` - Next.js App Router pages
- `/frontend/next.config.js` - Next.js configuration
- `/frontend/public/locales/` - Translation files (i18n)
- `/frontend/src/services/` - API services and utilities

### For Backend Work (Ultra-Minimal Architecture)
- `/backend/app/main.py` - Single-file FastAPI application with ALL endpoints
- `/backend/app/database.py` - SQLAlchemy models and database utilities  
- `/backend/app/webhooks.py` - Minimal webhook handlers

### For Testing/Validation
- `/automation/runner.js` - Main validation orchestrator
- `/automation/core/` - Service health and OAuth validators
- `/justfile` - All available commands
- `/docker-compose.yml` - Docker service definitions

## Quality Standards & Testing Guardrails

### MANDATORY Rules
1. **All tests must pass** before any code output or deployment
2. **Run comprehensive validation suite** before claiming task completion
3. **If tests fail**, perform iterative Root Cause Analysis (RCA) until resolved
4. **Never deliver code** without successful validation
5. **Response Protocol**: If tests fail, respond: `Tests are still failing - performing RCA...`
6. **Always validate assumptions** with the user before coding

### Iterative RCA Process for Test Failures
1. **Identify specific failure point** with detailed error analysis
2. **Diagnose root cause** (dependencies, config, environment, code issues)
3. **Implement targeted fix** addressing the core issue
4. **Re-run validation suite** to verify fix effectiveness  
5. **Repeat until all tests pass** - no exceptions
6. **Document resolution** for future reference

## Common Operations Cheatsheet

### Daily Development (Updated 2025)
```bash
# RECOMMENDED: Start Vercel-matched development
just dev-local               # Starts local Python + npm servers

# Alternative: Individual services
just backend-local           # Python 3.9 + uvicorn (matches Vercel)
just frontend-local          # npm run dev (matches Vercel)

# Testing & Health Checks
just test-backend-local      # Local backend health
just validate                # Full validation suite

# LEGACY: Docker development (deprecated due to production mismatch)
just dev                     # Docker containers
just down                    # Stop Docker containers
```

### Testing & Quality Checks
```bash
# Frontend checks (in frontend directory)
npm run typecheck
npm run lint
npm run build

# Backend checks (in backend directory)
python3 -m py_compile app/main.py

# Full validation suite (REQUIRED)
just validate
```

### Debugging Common Issues
```bash
# OAuth not working?
just validate-oauth
grep KINDE .env

# Services not starting?
just status
docker-compose logs -f

# Port conflicts?
FRONTEND_PORT=3001 BACKEND_PORT=8001 just dev

# Database issues?
docker-compose down -v
docker-compose up --build
```

## Development Architecture (Updated Jan 2025)

### Core Principles
- **Local development matches Vercel production** - no Docker for daily development
- **Same Python version everywhere** - Python 3.9 locally and in Vercel
- **Same database everywhere** - Supabase PostgreSQL in all environments  
- **Never hardcode ports** - Use environment variables for service communication
- **Keep `output: 'standalone'`** in Next.js for Vercel deployments

### Development Approaches
- **Primary (Recommended)**: Local development with `just dev-local` - matches Vercel exactly
- **Legacy (Deprecated)**: Docker development with `just dev` - causes production mismatch issues

### Service Discovery Standards
- **Container-to-container**: Use service names (`http://backend:8000`, `http://frontend:3000`)
- **External access**: Use environment-configured ports (`${BACKEND_PORT:-8000}`)
- **Frontend-to-Backend**: Direct communication via API proxy routes in frontend
- **Database**: Always use Docker container networking (`postgres:5432`)

## Environment Configuration

### Development (.env file at project root)
```bash
# Docker service URLs (internal)
BACKEND_API_URL=http://backend:8000
FRONTEND_URL=http://frontend:3000

# External access (development)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Authentication (Required)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
SESSION_SECRET=your_session_secret # Required for JWT signing

# Optional Services
PERSONA_API_KEY=your_persona_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### Production (Vercel)
```bash
# Frontend deployment
NEXT_PUBLIC_API_URL=https://herit-claude.vercel.app
NEXT_PUBLIC_FRONTEND_URL=https://herit.vercel.app

# Backend deployment
DATABASE_URL=postgresql://...
```

## JWT Authentication Architecture (2025)

### Current Auth Flow
1. **Frontend** handles OAuth 2.0 + PKCE flow directly via Next.js API routes
2. **Frontend** → Backend API (JWT token-based auth via proxy routes)
3. **Frontend** manages authentication state via JWT tokens in HTTP-only cookies
4. **Frontend** never exposes raw OAuth tokens to client-side JavaScript
5. **JWT tokens** can be updated with new user information via session re-issuance

### Key Auth Files
- `/frontend/src/app/api/auth/google/route.ts` - Google OAuth handler with JWT
- `/frontend/src/lib/jwt.ts` - JWT token creation and validation
- `/frontend/src/lib/auth-cookies.ts` - JWT cookie management utilities
- `/frontend/src/hooks/useAuth.ts` - Primary authentication hook
- `/frontend/src/app/api/auth/session/route.ts` - JWT session updates
- `/frontend/src/app/api/proxy/[...path]/route.ts` - Backend API proxy

### Security Requirements
- All authentication flows handled within frontend Next.js API routes
- JWT tokens stored in HTTP-only, secure cookies
- CSRF protection enabled on authentication endpoints
- API proxy routes handle secure backend communication
- JWT tokens signed with HMAC SHA-256 using SESSION_SECRET

## Troubleshooting Guide

### Service Won't Start
```bash
# Check status
just status

# View logs
docker-compose logs -f [service_name]

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
just dev
```

### OAuth/Authentication Issues
```bash
# Validate OAuth flow
just validate-oauth

# Check environment variables
grep GOOGLE .env
echo $GOOGLE_CLIENT_ID

# Common fixes:
# 1. Ensure GOOGLE_CLIENT_SECRET is set
# 2. Check redirect URLs match Google OAuth configuration
# 3. Verify SESSION_SECRET is set for JWT signing
```

### TypeScript/Build Errors
```bash
# Check TypeScript
docker-compose run --rm frontend npm run typecheck

# Clean build
docker-compose run --rm frontend rm -rf .next
docker-compose run --rm frontend npm run build
```

### Database Connection Issues
```bash
# Reset database
docker-compose down -v
docker-compose up postgres -d
docker-compose up --build

# Check connection
docker-compose exec postgres psql -U user -d herit -c "SELECT 1"
```

## Git Workflow & Deployment

### Before Committing
```bash
# MANDATORY: Run validation
just validate

# If validation passes, stage changes
git add .

# Commit with descriptive message
git commit -m "feat: your change description"
```

### Deployment Process

**Frontend (GitHub Integration + Monorepo)**:
```bash
# Automatic deployment via GitHub integration
git push origin main  # Triggers Vercel build from monorepo root
```

**Backend (GitHub Integration + Isolated)**:
```bash
# Automatic deployment via GitHub integration with Root Directory setting
git push origin main  # Triggers isolated backend build

# Manual deployment (if needed)
cd backend
vercel --prod
```

### Vercel Project Configuration (CRITICAL)

**Backend Project Settings** (fixes monorepo contamination):
```
Root Directory: "backend"
Include files outside root directory: ❌ DISABLED
Skip deployments when no changes: ✅ ENABLED
```

**Important**: These settings prevent the "No Output Directory named 'public' found" error by ensuring the backend deploys as an isolated Python serverless function without monorepo interference.

**Current Production URLs**:
- Frontend: Deployed from monorepo root
- Backend: `https://backend-myc9tp8c3-dean-herits-projects.vercel.app` (latest)

## Project Structure Map

```
herit/
├── frontend/                 # Next.js 14 with integrated OAuth
│   ├── src/app/             # App Router pages
│   │   ├── api/auth/        # OAuth handlers (replaced BFF)
│   │   └── api/proxy/       # Backend API proxy
│   ├── src/components/      # React components
│   ├── src/hooks/           # Custom hooks
│   ├── src/services/        # API services
│   └── public/locales/      # i18n translations
│
├── backend/                  # ISOLATED FastAPI Python service
│   ├── app/main.py          # Application entry
│   ├── app/database.py      # Database models & connections
│   ├── app/webhooks.py      # Webhook handlers
│   ├── requirements.txt     # Python dependencies
│   ├── vercel.json          # Isolated deployment config
│   └── .vercelignore        # Blocks monorepo contamination
│
├── automation/               # Validation framework
│   ├── runner.js            # Main orchestrator
│   ├── core/                # Health & OAuth validators
│   └── workflows/           # Business logic tests
│
├── docker-compose.yml        # Service orchestration
├── justfile                 # Command runner
├── .env                     # Environment variables
└── CLAUDE.md               # This file

**ARCHITECTURE NOTES**:
- Backend is ISOLATED: No package.json, no Node.js dependencies
- Frontend uses Turborepo: Monorepo build at root level  
- Deployment: Completely separate Vercel projects
- Communication: Frontend proxy → Isolated backend API
```

## Important Notes & Mandatory Practices

### MUST DO
- ✅ **MANDATORY TESTING**: All validation must pass before any code delivery
- ✅ **Local Development**: Use `just dev-local` for Vercel-matched development environment
- ✅ **Service URLs**: Always use environment variables for service communication
- ✅ **Fail-Fast Policy**: Stop immediately if any validation fails and perform RCA
- ✅ **Health Checks**: All services must have working health check endpoints
- ✅ **Zero-Error Policy**: TypeScript compilation must succeed with zero errors
- ✅ **NEVER USE `echo`**: ALWAYS use `printf` for environment variables and piping to avoid newline corruption

### MUST NOT DO
- ❌ **No GitHub Actions**: Project uses Vercel deployment exclusively
- ❌ **No Docker for daily development**: Use `just dev-local` instead of `just dev`
- ❌ **No hardcoded URLs**: Use environment variables
- ❌ **No skipping validation**: Always run `just validate` before claiming completion

## JWT Migration Status (January 2025)

### ✅ **MIGRATION COMPLETED**
The complete migration from iron-session to JWT authentication has been successfully completed:

- ✅ **JWT Implementation**: Full JWT-based authentication system using `jose` library
- ✅ **Iron-Session Removal**: All iron-session dependencies and references removed
- ✅ **Session Updates**: JWT tokens can be re-issued with updated user information
- ✅ **Code Quality**: All TypeScript, ESLint, and build validations pass
- ✅ **Legacy Cleanup**: All migration test routes and bypass endpoints removed

### Key Authentication Features
- **JWT Tokens**: Stored in HTTP-only cookies, signed with HMAC SHA-256
- **User Updates**: Session endpoint supports updating user information via JWT re-issuance
- **Secure Storage**: OAuth access tokens stored separately for backend API authentication
- **Client Hook**: Single `useAuth()` hook provides all authentication functionality

### Migration Results
- **Zero Breaking Changes**: All existing functionality maintained
- **Improved Security**: JWT tokens more secure than encrypted session cookies
- **Better Performance**: Reduced server-side session storage requirements
- **Cleaner Codebase**: Removed 5 legacy routes and test pages

## Quick Validation Checklist

Before responding with completed code:
- [ ] Run `just validate` - all tests pass?
- [ ] TypeScript compiles? (`cd frontend && npm run typecheck`)
- [ ] Backend compiles? (`cd backend && python3 -m py_compile app/main.py`)
- [ ] Services healthy? (`just validate-services`)
- [ ] OAuth working? (`just validate-oauth`)

If any check fails, perform RCA and fix before proceeding.