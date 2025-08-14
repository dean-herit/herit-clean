# ✨ Herit - Estate Planning Platform

> **Ultra-clean, cloud-first estate planning application** with Next.js 15, TypeScript, and Drizzle ORM.

Herit is a professional legal-tech platform for creating and managing wills with OAuth authentication, identity verification (KYC), and comprehensive estate planning features.

## 🚀 Instant Setup

```bash
# 1. Clone and enter
git clone <repo-url> herit && cd herit

# 2. One-command setup  
just setup

# 3. Start developing
just dev
```

**That's it!** 🎉 Visit http://localhost:3000

## 💎 Clean Architecture

```
herit/
├── src/
│   ├── app/              # Next.js 15 App Router
│   ├── components/       # React components
│   ├── db/               # Drizzle ORM (schema + connection)
│   ├── actions/          # Server actions
│   └── lib/              # Utilities (auth, sentry, etc.)
├── drizzle/              # Database migrations
├── public/locales/       # i18n (en, de, fr-ca)
├── .env.example          # Environment template
└── justfile              # All commands
```

## ⚡ Core Commands

| Command | Purpose |
|---------|---------|
| `just setup` | 🚀 **Complete environment setup** |
| `just dev` | 💻 Start development server |
| `just db-studio` | 🔍 Database management UI |
| `just build` | 🏗️ Production build |
| `just deploy` | 🚀 Deploy to Vercel |

[See all commands](#commands) 👇

## 🔧 Environment

**Super simple**: Just 2 files!

1. **`.env.example`** - Template with all variables
2. **`.env.local`** - Your local configuration

```bash
# Copy template and configure
cp .env.example .env.local
# Edit .env.local with your database URL and auth secrets
```

**Required variables:**
- `POSTGRES_URL` - Database connection (Supabase/Vercel/Neon)
- `SESSION_SECRET` - JWT signing secret
- Auth providers (Kinde, Google, Apple)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL + Drizzle ORM (type-safe)
- **Auth**: JWT + OAuth (Google, Apple, Kinde)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (cloud-first)
- **Monitoring**: Sentry error tracking

## 🗄️ Database

**Cloud-first** - no Docker required!

```bash
just db-studio     # Open visual database editor
just db-migrate    # Run migrations
just db-generate   # Create new migration
```

Supports any PostgreSQL provider:
- ✅ **Supabase** (recommended)
- ✅ **Vercel Postgres**
- ✅ **Neon**
- ✅ **Any PostgreSQL instance**

## 📋 All Commands

### 🚀 Quick Start
```bash
just setup        # Complete environment setup
just dev          # Start development server  
just status       # Check project health
```

### 📊 Development
```bash
just build        # Production build
just typecheck    # TypeScript validation
just lint         # Code linting
just test         # Run tests
```

### 🗄️ Database
```bash
just db-studio    # Visual database editor
just db-migrate   # Run migrations
just db-generate  # Generate migration
just db-push      # Push schema (dev only)
```

### 🚀 Deployment
```bash
just deploy       # Deploy to production
just pre-deploy   # Pre-deployment checks
just setup-vercel # Configure Vercel env
```

### 🛠️ Utilities
```bash
just check-env    # Validate environment
just help         # Show all commands
just status       # Project health check
```

## 🎯 Features

### ✅ Current Implementation
- **Next.js 15** with App Router
- **TypeScript** throughout
- **Drizzle ORM** for type-safe database
- **Server Actions** for API
- **Tailwind CSS** styling  
- **Multi-language** support (en, de, fr-ca)
- **JWT Authentication** with OAuth providers
- **Database schema** for estate planning
- **Sentry** error tracking
- **Vercel** deployment ready

### 📚 Legacy Reference  
Complete feature reference in [`LEGACY_CODE_ARCHIVE.md`](LEGACY_CODE_ARCHIVE.md):
- 20+ UI pages and 40+ components
- 50+ API endpoints
- Authentication system (JWT + OAuth)
- Digital signature system  
- Identity verification integration
- Complete database schema

## 🌟 Development Workflow

1. **Reference**: Check [`LEGACY_CODE_ARCHIVE.md`](LEGACY_CODE_ARCHIVE.md) for specifications
2. **Implement**: Build in `src/` using clean architecture  
3. **Validate**: `just typecheck && just build`
4. **Deploy**: `just deploy`

## 📁 Project Organization

### Components (`src/components/`)
```
auth/           # Authentication forms
estate-planning/# Asset & beneficiary forms
ui/            # Reusable UI components
dashboard/     # Dashboard layouts
```

### Database (`src/db/`)
```
schema.ts      # Drizzle schema definitions
db.ts          # Database connection
```

### Actions (`src/actions/`)
```
auth.ts        # Authentication actions
assets.ts      # Asset management
beneficiaries.ts# Beneficiary management
```

## 🚢 Deployment

**One-command deployment** to Vercel:

```bash
just deploy
```

Or configure Vercel environment:
```bash  
just setup-vercel  # Auto-configure all env vars
vercel --prod      # Manual deploy
```

## 🔒 Security

- **JWT tokens** in HTTP-only cookies
- **Argon2** password hashing
- **Input validation** with Zod
- **Type safety** with TypeScript
- **Security headers** configured
- **OAuth 2.0 + PKCE** flow

## 🎨 Why This Architecture?

### ❌ Before (Legacy)
- 50+ config files scattered everywhere
- Docker complexity for simple development
- 6 different `.env` files
- Monolithic backend/frontend coupling
- Complex validation framework

### ✅ After (Clean) 
- **5 core config files** only
- **Cloud-first** - no Docker needed
- **2 environment files** total
- **Clean separation** of concerns
- **Instant setup** - `just setup && just dev`

---

## 📞 Support

- **Commands**: `just help`
- **Issues**: Create GitHub issue
- **Architecture**: See [`LEGACY_CODE_ARCHIVE.md`](LEGACY_CODE_ARCHIVE.md)

---

**Built with ❤️ using modern, clean architecture principles.**