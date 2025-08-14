#!/bin/bash

# Google OAuth Setup Script
set -e

echo "🔐 Setting Up Google OAuth for Herit"
echo "====================================="
echo ""

# Check if running in production
if [ "$VERCEL" = "1" ]; then
    echo "Setting up for Vercel production..."
    REDIRECT_URI="https://herit-claude.vercel.app/api/auth/google/callback"
else
    echo "Setting up for local development..."
    REDIRECT_URI="http://localhost:3001/api/auth/google/callback"
fi

echo "📋 Google OAuth Setup Instructions:"
echo ""
echo "1. Go to: https://console.cloud.google.com/"
echo "2. Select or create a project"
echo "3. Go to 'APIs & Services' > 'Credentials'"
echo "4. Click 'Create Credentials' > 'OAuth 2.0 Client ID'"
echo "5. Application type: 'Web application'"
echo "6. Add these Authorized redirect URIs:"
echo "   - http://localhost:3000/api/auth/google/callback"
echo "   - http://localhost:3001/api/auth/google/callback"
echo "   - https://herit-claude.vercel.app/api/auth/google/callback"
echo "   - https://herit.vercel.app/api/auth/google/callback"
echo ""
echo "7. Copy your Client ID and Client Secret"
echo ""

# For Vercel deployment
if [ "$1" = "--vercel" ]; then
    echo "📦 Setting up Vercel environment variables..."
    echo ""
    echo "Run these commands:"
    echo ""
    echo "vercel env add GOOGLE_CLIENT_ID production"
    echo "vercel env add GOOGLE_CLIENT_SECRET production"
    echo "vercel env add GOOGLE_REDIRECT_URI production"
    echo "vercel env add SESSION_SECRET production"
    echo ""
    echo "For SESSION_SECRET, use this generated value:"
    openssl rand -base64 48
    echo ""
    exit 0
fi

# Local setup
echo "Setting up local environment..."
echo ""

# Generate secure session secret if needed
if ! grep -q "SESSION_SECRET=" .env.local 2>/dev/null || grep -q "your-super-secret" .env.local 2>/dev/null; then
    echo "Generating secure SESSION_SECRET..."
    SESSION_SECRET=$(openssl rand -base64 48)
    
    if [ -f .env.local ]; then
        # Update existing file
        if grep -q "SESSION_SECRET=" .env.local; then
            sed -i.bak "s|SESSION_SECRET=.*|SESSION_SECRET=\"$SESSION_SECRET\"|" .env.local
        else
            echo "SESSION_SECRET=\"$SESSION_SECRET\"" >> .env.local
        fi
    else
        # Create new file
        cp .env.example .env.local
        sed -i.bak "s|SESSION_SECRET=.*|SESSION_SECRET=\"$SESSION_SECRET\"|" .env.local
    fi
    echo "✅ SESSION_SECRET generated and saved"
fi

echo ""
echo "📝 Next steps:"
echo "1. Get your Google OAuth credentials from the console"
echo "2. Update .env.local with:"
echo "   GOOGLE_CLIENT_ID=\"your-actual-client-id.apps.googleusercontent.com\""
echo "   GOOGLE_CLIENT_SECRET=\"your-actual-secret\""
echo "   GOOGLE_REDIRECT_URI=\"$REDIRECT_URI\""
echo ""
echo "3. Test locally with: npm run dev"
echo "4. Deploy to production with: ./scripts/setup-google-oauth.sh --vercel"