#!/bin/bash

# NeoPress Build Script for Render

echo "🚀 Starting NeoPress build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build client
echo "🎨 Building React frontend..."
cd client
npm install
npm run build

if [ ! -d "build" ]; then
  echo "❌ Client build failed - build directory not found"
  exit 1
fi

echo "✅ Frontend build successful"
cd ..

# Install server dependencies
echo "🔧 Installing server dependencies..."
cd server
npm install
echo "✅ Server dependencies installed"
cd ..

echo "🎉 Build complete!"
