#!/bin/bash

# Herit-Clean Vercel Setup Script
set -e

echo "🚀 Setting up Vercel environment variables for herit-clean..."

# Database (same as current deployment)
vercel env add POSTGRES_URL "postgres://postgres.iwtwwnbwdvlsfzwbotxu:IrVtjNgWe7LkL1jH@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x" --scope production --yes
vercel env add POSTGRES_PRISMA_URL "postgres://postgres.iwtwwnbwdvlsfzwbotxu:IrVtjNgWe7LkL1jH@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true" --scope production --yes

# JWT Authentication
vercel env add JWT_SECRET "ultra-secure-jwt-secret-for-herit-production-2025-32chars" --scope production --yes
vercel env add SESSION_SECRET "ultra-secure-jwt-secret-for-herit-production-2025-32chars" --scope production --yes
vercel env add REFRESH_SECRET "different-refresh-secret-for-herit-production-2025" --scope production --yes

# Application
vercel env add NEXT_PUBLIC_APP_URL "https://herit.vercel.app" --scope production --yes
vercel env add NODE_ENV "production" --scope production --yes

echo "✅ Environment variables configured!"
echo ""
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "🔗 Your application is live at: https://herit.vercel.app"