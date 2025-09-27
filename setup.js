#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Chat Application...\n');

// Check if firebase.js exists
const firebaseJsPath = path.join(__dirname, 'firebase.js');
const firebaseTemplatePath = path.join(__dirname, 'firebase.template.js');

if (!fs.existsSync(firebaseJsPath)) {
  if (fs.existsSync(firebaseTemplatePath)) {
    fs.copyFileSync(firebaseTemplatePath, firebaseJsPath);
    console.log('✅ firebase.js created from template');
    console.log('📝 Edit firebase.js with your Firebase configuration\n');
  } else {
    console.log('⚠️  firebase.template.js not found');
  }
} else {
  console.log('✅ firebase.js already exists\n');
}

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env created from example');
    console.log('📝 Edit .env with your environment variables\n');
  } else {
    console.log('⚠️  .env.example not found');
  }
} else {
  console.log('✅ .env already exists\n');
}

console.log('🎉 Setup complete!\n');
console.log('Next steps:');
console.log('1. Edit firebase.js with your Firebase configuration (or keep mock for development)');
console.log('2. Edit .env with your environment variables');
console.log('3. Run "npm start" to start the development server\n');
console.log('Happy coding! 🚀');