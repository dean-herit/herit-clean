#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 OAuth Configuration Diagnostic');
console.log('==================================\n');

// Check for .env.local file
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local not found!');
    console.log('   Run: cp .env.example .env.local');
    process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Check OAuth configuration
const checks = [
    {
        name: 'Google OAuth',
        vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
        required: true
    },
    {
        name: 'Session Secret',
        vars: ['SESSION_SECRET'],
        required: true,
        validator: (value) => {
            if (!value || value.length < 32) {
                return 'Must be at least 32 characters';
            }
            if (value === 'your-session-secret-32-characters-minimum' || 
                value === 'your-super-secret-session-key-32-chars-min') {
                return 'Using default placeholder value - please generate a secure secret';
            }
            return null;
        }
    },
    {
        name: 'Google Redirect URI',
        vars: ['GOOGLE_REDIRECT_URI'],
        required: false
    }
];

let hasErrors = false;

checks.forEach(check => {
    console.log(`\n${check.name}:`);
    
    check.vars.forEach(varName => {
        const value = process.env[varName];
        const isSet = value && value !== '' && 
                     !value.includes('your_') && 
                     !value.includes('your-');
        
        if (!value) {
            console.log(`  ❌ ${varName}: Not set`);
            if (check.required) hasErrors = true;
        } else if (!isSet) {
            console.log(`  ⚠️  ${varName}: Using placeholder value`);
            if (check.required) hasErrors = true;
        } else {
            // Run validator if exists
            if (check.validator) {
                const error = check.validator(value);
                if (error) {
                    console.log(`  ⚠️  ${varName}: ${error}`);
                    hasErrors = true;
                } else {
                    console.log(`  ✅ ${varName}: Configured (${value.substring(0, 10)}...)`);
                }
            } else {
                console.log(`  ✅ ${varName}: Configured (${value.substring(0, 10)}...)`);
            }
        }
    });
});

console.log('\n==================================');

if (hasErrors) {
    console.log('\n⚠️  OAuth configuration issues detected!');
    console.log('\nTo fix:');
    console.log('1. Run: ./scripts/setup-oauth.sh');
    console.log('2. Or manually update .env.local with your OAuth credentials');
    console.log('\nFor Google OAuth:');
    console.log('  - Visit: https://console.cloud.google.com/');
    console.log('  - Create OAuth 2.0 credentials');
    console.log('  - Add redirect URI: http://localhost:3001/api/auth/google/callback');
    process.exit(1);
} else {
    console.log('\n✅ OAuth configuration looks good!');
    console.log('\nNext steps:');
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Test Google sign-in at http://localhost:3001/login');
}