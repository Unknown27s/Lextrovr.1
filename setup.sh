#!/bin/bash

echo "🚀 Starting Author Vocabulary Companion..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Setting up Backend...${NC}"
cd backend
npm install
cp .env.example .env
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

echo -e "${BLUE}📦 Setting up Frontend...${NC}"
cd ../frontend
npm install
cp .env.example .env
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

cd ..

echo -e "${YELLOW}✨ Setup complete!${NC}"
echo ""
echo -e "${GREEN}To start development:${NC}"
echo ""
echo -e "${BLUE}Option 1: Using Docker Compose${NC}"
echo "  docker-compose up"
echo ""
echo -e "${BLUE}Option 2: Manual startup${NC}"
echo "  Terminal 1: cd backend && npm run start:dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}Backend:${NC}  http://localhost:3000"
echo ""
