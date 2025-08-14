#!/bin/bash

# Remove all corrupted environment variables
vercel env rm GOOGLE_CLIENT_ID production --yes 2>/dev/null || true
vercel env rm GOOGLE_CLIENT_SECRET production --yes 2>/dev/null || true  
vercel env rm GOOGLE_REDIRECT_URI production --yes 2>/dev/null || true

# Wait for changes to propagate
sleep 2

# Add them back using vercel CLI directly (not piped)
vercel env add GOOGLE_CLIENT_ID production << EOF
62753751660-do7t6uqpngmd3463mspv6mj8vh4j9vqi.apps.googleusercontent.com
EOF

vercel env add GOOGLE_CLIENT_SECRET production << EOF  
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
EOF

vercel env add GOOGLE_REDIRECT_URI production << EOF
https://herit.vercel.app/api/auth/google/callback
EOF

echo "Environment variables updated. Deploying..."
vercel --prod --force