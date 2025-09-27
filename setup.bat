@echo off
echo 🚀 Setting up Chat Application...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if firebase.js exists, if not create from template
if not exist "firebase.js" (
    echo 🔧 Creating firebase.js from template...
    copy "firebase.template.js" "firebase.js"
    echo ✅ firebase.js created! Edit this file with your Firebase configuration.
) else (
    echo ✅ firebase.js already exists
)

REM Check if .env exists, if not create from example
if not exist ".env" (
    echo 🔧 Creating .env from example...
    copy ".env.example" ".env"
    echo ✅ .env created! Edit this file with your environment variables.
) else (
    echo ✅ .env already exists
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit firebase.js with your Firebase configuration (or keep mock for development)
echo 2. Edit .env with your environment variables
echo 3. Run 'npx expo start' to start the development server
echo.
echo Happy coding! 🚀
pause