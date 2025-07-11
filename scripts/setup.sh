#!/bin/bash

# YourGPT SDK Setup Script
echo "🚀 Setting up YourGPT SDK..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run TypeScript check
echo "🔍 Running TypeScript check..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ TypeScript check passed"
else
    echo "❌ TypeScript check failed"
    exit 1
fi

# Run linting
echo "🔧 Running linting..."
npm run lint

if [ $? -eq 0 ]; then
    echo "✅ Linting passed"
else
    echo "⚠️  Linting issues found (but continuing...)"
fi

# Build the project
echo "🏗️  Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -eq 0 ]; then
    echo "✅ All tests passed"
else
    echo "❌ Some tests failed"
    exit 1
fi

echo ""
echo "🎉 YourGPT SDK setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your widget ID in the examples"
echo "2. Run 'npm run dev' to start development"
echo "3. Run 'npm run build' to build for production"
echo "4. Run 'npm run test' to run tests"
echo ""
echo "For more information, see the README.md file."