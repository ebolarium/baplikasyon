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
echo "Files in current directory:"
ls -la

# Clean npm cache
echo "Cleaning npm cache"
npm cache clean --force

# Install root dependencies
echo "Installing server dependencies"
npm install

# Check if express is installed
echo "Checking for express module:"
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

# List all modules to verify express is there
echo "List of installed modules:"
ls -la node_modules

echo "All dependencies installed successfully!" 