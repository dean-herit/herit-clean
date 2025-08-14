#!/bin/bash

# OAuth Setup Script for Herit
set -e

echo "🔐 OAuth Configuration Setup for Herit"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
fi

echo "This script will help you configure OAuth providers."
echo ""
echo "📌 Required steps:"
echo ""
echo "1️⃣  Google OAuth Setup:"
echo "   a. Go to https://console.cloud.google.com/"
echo "   b. Create a new project or select existing"
echo "   c. Enable Google+ API"
echo "   d. Go to Credentials → Create Credentials → OAuth 2.0 Client ID"
echo "   e. Application type: Web application"
echo "   f. Add authorized redirect URIs:"
echo "      - Development: http://localhost:3001/api/auth/google/callback"
echo "      - Production: https://YOUR-DOMAIN.vercel.app/api/auth/google/callback"
echo ""

read -p "Do you have your Google OAuth credentials ready? (y/n): " has_google

if [ "$has_google" = "y" ] || [ "$has_google" = "Y" ]; then
    echo ""
    read -p "Enter your Google Client ID: " google_client_id
    read -p "Enter your Google Client Secret: " google_client_secret
    
    # Update .env.local
    if [ "$(uname)" = "Darwin" ]; then
        # macOS
        sed -i '' "s|GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=\"$google_client_id\"|" .env.local
        sed -i '' "s|GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=\"$google_client_secret\"|" .env.local
    else
        # Linux
        sed -i "s|GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=\"$google_client_id\"|" .env.local
        sed -i "s|GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=\"$google_client_secret\"|" .env.local
    fi
    
    echo "✅ Google OAuth configured!"
fi

echo ""
echo "2️⃣  Session Secret:"
echo "   A secure random string for signing JWT tokens (minimum 32 characters)"
echo ""

# Check if SESSION_SECRET is already set properly
current_secret=$(grep "SESSION_SECRET=" .env.local | cut -d'"' -f2)
if [ "$current_secret" = "your-session-secret-32-characters-minimum" ] || [ "$current_secret" = "your-super-secret-session-key-32-chars-min" ]; then
    echo "⚠️  SESSION_SECRET is using default value. Generating secure secret..."
    
    # Generate secure random secret
    new_secret=$(openssl rand -base64 48 | tr -d '\n')
    
    if [ "$(uname)" = "Darwin" ]; then
        sed -i '' "s|SESSION_SECRET=.*|SESSION_SECRET=\"$new_secret\"|" .env.local
    else
        sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=\"$new_secret\"|" .env.local
    fi
    
    echo "✅ Secure SESSION_SECRET generated!"
else
    echo "✅ SESSION_SECRET already configured"
fi

echo ""
echo "3️⃣  Production Deployment (Vercel):"
echo "   Don't forget to add these environment variables to your Vercel project:"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - SESSION_SECRET"
echo "   - GOOGLE_REDIRECT_URI (set to your production URL + /api/auth/google/callback)"
echo ""
echo "   Run: vercel env add [variable_name]"
echo ""

echo "🎉 OAuth setup complete!"
echo ""
echo "Test your configuration with: npm run dev"