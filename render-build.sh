#!/usr/bin/env bash
# Exit on error
set -e

# Print all commands for debugging
set -x

# Show Node.js and npm versions for debugging
echo "Node version:"
node --version
echo "npm version:"
npm --version

# List all files and directories
echo "Files in current directory before install:"
ls -la

# Create temp directory with proper permissions
echo "Creating temp directory with proper permissions"
mkdir -p temp
chmod 777 temp

# Clean npm cache
echo "Cleaning npm cache"
npm cache clean --force

# Explicitly install server dependencies first
echo "Installing server dependencies"
npm install express cors dotenv mongoose morgan --no-optional

# Then install all dependencies (including dev dependencies)
echo "Installing all server dependencies"
npm install

# List all modules to verify express is there
echo "Server modules after install:"
ls -la node_modules | grep express

# Install client dependencies
echo "Installing client dependencies"
cd client
npm install

# Build client
echo "Building client"
npm run build

# Go back to the root
cd ..

# List all files after build
echo "Files after build:"
ls -la

echo "All dependencies installed and build completed successfully!" 