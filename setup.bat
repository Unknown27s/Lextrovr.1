@echo off
echo 🚀 Starting Author Vocabulary Companion...
echo.

echo 📦 Setting up Backend...
cd backend
call npm install
if not exist .env copy .env.example .env
echo ✅ Backend dependencies installed
cd ..
echo.

echo 📦 Setting up Frontend...
cd frontend
call npm install
if not exist .env copy .env.example .env
echo ✅ Frontend dependencies installed
cd ..
echo.

echo ✨ Setup complete!
echo.
echo To start development:
echo.
echo Option 1: Using Docker Compose
echo   docker-compose up
echo.
echo Option 2: Manual startup
echo   Terminal 1: cd backend ^&^& npm run start:dev
echo   Terminal 2: cd frontend ^&^& npm run dev
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo.
pause
