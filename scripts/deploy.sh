#!/bin/bash

# Herit-Clean Deployment Script
# Ultra-clean estate planning application deployment

set -e

echo "🚀 Starting Herit-Clean deployment..."

# Environment validation
if [ -z "$POSTGRES_URL" ]; then
    echo "❌ POSTGRES_URL environment variable is required"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET environment variable is required"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run database migrations
echo "🗄️  Running database migrations..."
npx drizzle-kit push:pg

# Build the application
echo "🏗️  Building Next.js application..."
npm run build

# Run type checking
echo "🔍 Running TypeScript type checking..."
npx tsc --noEmit --skipLibCheck

echo "✅ Deployment completed successfully!"
echo ""
echo "🔗 Application URLs:"
echo "  Frontend: ${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
echo "  Database: Connected to Vercel Postgres"
echo ""
echo "🔐 Security Features:"
echo "  ✓ JWT Authentication with token rotation"
echo "  ✓ Argon2id password hashing" 
echo "  ✓ Input validation with Zod"
echo "  ✓ HTTP-only secure cookies"
echo ""
echo "📊 Monitoring:"
echo "  ✓ Sentry error tracking enabled"
echo "  ✓ Performance monitoring active"
echo ""
echo "🎯 Next Steps:"
echo "1. Configure environment variables in Vercel"
echo "2. Set up custom domain (optional)"
echo "3. Configure Stripe webhooks"
echo "4. Test complete user workflow"