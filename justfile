# Herit Estate Planning Platform - Development Commands  
# Cloud-first development with Next.js 15 and Drizzle ORM

set shell := ["bash", "-c"]

# Default command - show available commands
default:
    @just --list

# =============================================================================
# DEVELOPMENT COMMANDS
# =============================================================================

# Start development server
dev:
    @echo "🚀 Starting Herit development server..."
    @npm run dev

# Build for production
build:
    @echo "🏗️ Building Herit for production..."
    @npm run build

# Install dependencies
install:
    @echo "📦 Installing dependencies..."
    @npm install

# Run linting
lint:
    @echo "🔍 Linting code..."
    @npm run lint

# Run TypeScript type checking
typecheck:
    @echo "🔎 Running TypeScript type checking..."
    @npm run typecheck

# Run tests (when implemented)
test:
    @echo "🧪 Running tests..."
    @npm run test

# =============================================================================
# DATABASE COMMANDS (Cloud-first)
# =============================================================================

# Generate new database migration
db-generate:
    @echo "🔧 Generating new database migration..."
    @npm run db:generate

# Run database migrations
db-migrate:
    @echo "🗄️ Running database migrations..."
    @npm run db:migrate

# Push schema changes to database (dev only)
db-push:
    @echo "🚀 Pushing schema changes to database..."
    @npm run db:push

# Open database studio
db-studio:
    @echo "🔍 Opening Drizzle Studio..."
    @npm run db:studio

# =============================================================================
# DEPLOYMENT COMMANDS
# =============================================================================

# Deploy to production (Vercel)
deploy:
    @echo "🚀 Deploying to production..."
    @npm run deploy

# Setup Vercel environment variables
setup-vercel:
    @echo "⚙️ Setting up Vercel environment..."
    @./scripts/setup-vercel.sh

# =============================================================================
# UTILITY COMMANDS
# =============================================================================

# Check environment configuration
check-env:
    @echo "⚙️ Checking environment configuration..."
    @if [ -f .env.local ]; then \
        echo "✅ .env.local exists"; \
        echo "📋 Database config:"; \
        grep -E "^POSTGRES_URL=" .env.local | head -1 | sed 's/=.*/=***hidden***/' || echo "❌ POSTGRES_URL missing"; \
        grep -E "^SESSION_SECRET=" .env.local | head -1 | sed 's/=.*/=***hidden***/' || echo "❌ SESSION_SECRET missing"; \
    else \
        echo "⚠️  .env.local missing - copy from .env.example"; \
    fi
    @if [ -f package.json ]; then \
        echo "✅ package.json exists"; \
    else \
        echo "❌ package.json missing!"; \
        exit 1; \
    fi

# Show project status
status:
    @echo "📊 Herit Project Status:"
    @echo "Node modules: $(if [ -d node_modules ]; then echo '✅ Installed'; else echo '❌ Missing - run: npm install'; fi)"
    @echo "Build ready: $(if [ -d .next ]; then echo '✅ Built'; else echo '⏳ Not built - run: npm run build'; fi)"
    @echo "Environment: $(if [ -f .env.local ]; then echo '✅ Configured'; else echo '❌ Missing - copy .env.example to .env.local'; fi)"

# =============================================================================
# DEVELOPMENT WORKFLOWS
# =============================================================================

# Full setup for new environment
setup:
    @echo "🚀 Setting up Herit development environment..."
    @if [ ! -f .env.local ]; then \
        echo "📋 Copying .env.example to .env.local..."; \
        cp .env.example .env.local; \
        echo "⚠️  Please edit .env.local with your database and auth credentials"; \
        echo "⚠️  Setup paused - edit .env.local then run 'just setup' again"; \
        exit 1; \
    fi
    @just install
    @just typecheck
    @echo "✅ Setup complete! Next steps:"
    @echo "  1. just dev           - Start development server"
    @echo "  2. just db-studio     - Open database management"
    @echo "  3. just db-migrate    - Run database migrations"

# Pre-deployment checks
pre-deploy:
    @echo "🔍 Running pre-deployment checks..."
    @just typecheck
    @just build
    @echo "✅ Pre-deployment checks passed!"

# Show help
help:
    @echo "🏗️ Herit Estate Planning Platform"
    @echo "   Cloud-first development with Next.js 15 + Drizzle ORM"
    @echo ""
    @echo "🚀 Quick Start:"
    @echo "  just setup             Set up complete development environment"
    @echo "  just dev               Start development server"
    @echo "  just db-studio         Open database management UI"
    @echo ""
    @echo "📊 Development:"
    @echo "  just build             Build for production"
    @echo "  just lint              Run code linting"
    @echo "  just typecheck         Run TypeScript checks"
    @echo "  just test              Run tests"
    @echo ""
    @echo "🗄️ Database:"
    @echo "  just db-generate       Generate new migration"
    @echo "  just db-migrate        Run database migrations"
    @echo "  just db-push           Push schema changes (dev only)"
    @echo "  just db-studio         Open Drizzle Studio"
    @echo ""
    @echo "🚀 Deployment:"
    @echo "  just deploy            Deploy to production"
    @echo "  just setup-vercel      Configure Vercel environment"
    @echo "  just pre-deploy        Run pre-deployment checks"
    @echo ""
    @echo "🛠️ Utilities:"
    @echo "  just check-env         Validate environment setup"
    @echo "  just status            Show project status"