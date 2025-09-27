#!/bin/bash
# Setup Script for Chat Application

echo "🚀 Setting up Chat Application..."

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

# Check if firebase.js exists, if not create from template
if [ ! -f "firebase.js" ]; then
    echo "🔧 Creating firebase.js from template..."
    cp firebase.template.js firebase.js
    echo "✅ firebase.js created! Edit this file with your Firebase configuration."
else
    echo "✅ firebase.js already exists"
fi

# Check if .env exists, if not create from example
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env from example..."
    cp .env.example .env
    echo "✅ .env created! Edit this file with your environment variables."
else
    echo "✅ .env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit firebase.js with your Firebase configuration (or keep mock for development)"
echo "2. Edit .env with your environment variables"
echo "3. Run 'npx expo start' to start the development server"
echo ""
echo "Happy coding! 🚀"