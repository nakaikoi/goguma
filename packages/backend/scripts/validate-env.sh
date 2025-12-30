#!/bin/bash
# Simple script to validate .env file structure

cd "$(dirname "$0")/.." || exit 1

if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "💡 Copy .env.example to .env and fill in your values"
    exit 1
fi

echo "🔍 Checking .env file structure..."
echo ""

# Check required variables
REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "PORT"
    "NODE_ENV"
    "API_PREFIX"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing required variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    exit 1
fi

echo "✅ All required variables present"
echo ""

# Check for placeholder values
echo "🔍 Checking for placeholder values..."
PLACEHOLDERS=(
    "your-project-id"
    "your-anon-key"
    "your-service-role-key"
    "example"
)

FOUND_PLACEHOLDERS=()
for placeholder in "${PLACEHOLDERS[@]}"; do
    if grep -qi "$placeholder" .env; then
        FOUND_PLACEHOLDERS+=("$placeholder")
    fi
done

if [ ${#FOUND_PLACEHOLDERS[@]} -gt 0 ]; then
    echo "⚠️  Found placeholder values in .env:"
    for placeholder in "${FOUND_PLACEHOLDERS[@]}"; do
        echo "   - Contains: $placeholder"
    done
    echo ""
    echo "💡 Make sure to replace all placeholder values with your actual credentials"
    exit 1
fi

# Validate URL format
if grep -q "^SUPABASE_URL=" .env; then
    SUPABASE_URL=$(grep "^SUPABASE_URL=" .env | cut -d '=' -f2-)
    if [[ ! "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
        echo "⚠️  SUPABASE_URL doesn't look like a valid Supabase URL"
        echo "   Expected format: https://your-project-id.supabase.co"
    else
        echo "✅ SUPABASE_URL format looks correct"
    fi
fi

# Validate keys look like JWT tokens
if grep -q "^SUPABASE_ANON_KEY=" .env; then
    ANON_KEY=$(grep "^SUPABASE_ANON_KEY=" .env | cut -d '=' -f2-)
    if [[ ! "$ANON_KEY" =~ ^eyJ ]]; then
        echo "⚠️  SUPABASE_ANON_KEY doesn't look like a valid JWT token"
        echo "   JWT tokens typically start with 'eyJ'"
    else
        echo "✅ SUPABASE_ANON_KEY format looks correct"
    fi
fi

if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" .env; then
    SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d '=' -f2-)
    if [[ ! "$SERVICE_KEY" =~ ^eyJ ]]; then
        echo "⚠️  SUPABASE_SERVICE_ROLE_KEY doesn't look like a valid JWT token"
        echo "   JWT tokens typically start with 'eyJ'"
    else
        echo "✅ SUPABASE_SERVICE_ROLE_KEY format looks correct"
    fi
fi

echo ""
echo "✅ .env file structure looks good!"
echo ""
echo "📝 To fully test the configuration, run:"
echo "   npm install"
echo "   npx tsx src/test-env.ts"

