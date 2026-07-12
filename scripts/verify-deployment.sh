#!/bin/bash

echo "PULSE v2.0 - Deployment Verification"
echo "===================================="
echo ""

# Check Node version
echo "Node Version:"
node --version
echo ""

# Check npm version
echo "Package Manager Version:"
pnpm --version
echo ""

# Check environment variables
echo "Environment Variables Status:"
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "✗ NEXT_PUBLIC_SUPABASE_URL not set"
else
  echo "✓ NEXT_PUBLIC_SUPABASE_URL configured"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "✗ SUPABASE_SERVICE_ROLE_KEY not set"
else
  echo "✓ SUPABASE_SERVICE_ROLE_KEY configured"
fi

echo ""

# Check dependencies
echo "Dependencies:"
pnpm list --depth=0 | grep -E "@supabase|next|react|tailwindcss"
echo ""

# Build status
echo "Build Status:"
if npm run build 2>&1 | grep -q "Compiled successfully"; then
  echo "✓ Build successful"
else
  echo "✗ Build failed"
fi

echo ""
echo "Deployment verification complete!"
