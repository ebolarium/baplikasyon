#!/usr/bin/env bash
# Exit on error
set -e

# Install root dependencies
echo "Installing server dependencies"
npm ci

# Install client dependencies
echo "Installing client dependencies"
cd client
npm ci
npm run build

# Go back to the root
cd ..

echo "All dependencies installed successfully!" 