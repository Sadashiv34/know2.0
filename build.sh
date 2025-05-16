#!/bin/bash

# Clean up unnecessary files before build
echo "Cleaning up unnecessary files..."
rm -rf node_modules/.cache
rm -rf .git
rm -rf .github
rm -rf .vscode
rm -rf coverage
rm -rf tests
rm -rf __tests__
rm -rf *.test.js
rm -rf *.spec.js

# Install only production dependencies
echo "Installing production dependencies..."
npm ci --production

# Build the application
echo "Building the application..."
npm run build

# Clean up node_modules after build to reduce file count
echo "Cleaning up node_modules..."
rm -rf node_modules

echo "Build completed successfully!"
