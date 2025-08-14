#!/usr/bin/env python3
"""
Pre-commit hook to validate CORS configuration
Prevents commits with invalid or missing CORS settings
"""
import sys
import re
import ast
from pathlib import Path

def validate_cors_config():
    """Validate CORS configuration in backend config files"""
    errors = []
    
    # Check config.py
    config_path = Path("backend/app/config.py")
    if not config_path.exists():
        errors.append("❌ backend/app/config.py not found")
        return errors
    
    config_content = config_path.read_text()
    
    # Check for CORS_ORIGINS definition
    if "CORS_ORIGINS" not in config_content:
        errors.append("❌ CORS_ORIGINS not defined in config.py")
    
    # Check for localhost in development
    if "localhost:3000" not in config_content and "127.0.0.1:3000" not in config_content:
        errors.append("❌ localhost:3000 not found in CORS_ORIGINS - frontend will be blocked")
    
    # Check for validated_cors_origins method
    if "validated_cors_origins" not in config_content:
        errors.append("❌ validated_cors_origins method not found - add resilient CORS validation")
    
    # Check main.py CORS middleware setup
    main_path = Path("backend/app/main.py")
    if main_path.exists():
        main_content = main_path.read_text()
        
        if "CORSMiddleware" not in main_content:
            errors.append("❌ CORSMiddleware not found in main.py")
        
        if "allow_origins=" not in main_content:
            errors.append("❌ allow_origins parameter not set in CORS middleware")
        
        if "allow_credentials=" not in main_content:
            errors.append("❌ allow_credentials parameter not set in CORS middleware")
        
        # Check for CORS logging
        if "[CORS]" not in main_content:
            errors.append("❌ CORS configuration logging not found - add for debugging")
    
    return errors

def validate_cors_health_endpoint():
    """Validate that CORS health check endpoint exists"""
    errors = []
    
    main_path = Path("backend/app/main.py")
    if main_path.exists():
        main_content = main_path.read_text()
        
        if "/health/cors" not in main_content:
            errors.append("❌ /health/cors endpoint not found - add for CORS monitoring")
    
    return errors

def check_frontend_cors_validation():
    """Check if frontend has CORS validation utilities"""
    errors = []
    
    cors_validator_path = Path("frontend/lib/cors-validator.ts")
    if not cors_validator_path.exists():
        errors.append("❌ frontend/lib/cors-validator.ts not found - add frontend CORS validation")
    else:
        validator_content = cors_validator_path.read_text()
        
        if "validateCORSConfiguration" not in validator_content:
            errors.append("❌ validateCORSConfiguration function not found in cors-validator.ts")
        
        if "runCORSValidation" not in validator_content:
            errors.append("❌ runCORSValidation function not found in cors-validator.ts")
    
    return errors

def main():
    """Run all CORS validations"""
    print("🔍 Validating CORS configuration...")
    
    all_errors = []
    all_errors.extend(validate_cors_config())
    all_errors.extend(validate_cors_health_endpoint())
    all_errors.extend(check_frontend_cors_validation())
    
    if all_errors:
        print("\n❌ CORS Configuration Issues Found:")
        for error in all_errors:
            print(f"  {error}")
        print("\n💡 Fix these issues before committing to prevent CORS problems in production.")
        print("📚 See backend/tests/test_cors_integration.py for examples.")
        return 1
    
    print("✅ CORS configuration validation passed!")
    return 0

if __name__ == "__main__":
    sys.exit(main())