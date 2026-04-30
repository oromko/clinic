#!/bin/bash

# FMCS Deployment Script
# Usage: ./deploy.sh [dev|prod]

set -e

ENV=${1:-dev}
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  FMCS Deployment Script${NC}"
echo -e "${GREEN}=====================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Environment: ${ENV}${NC}"

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down

# Build images
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose build --no-cache

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Check service health
echo -e "${YELLOW}Checking service health...${NC}"
docker-compose ps

# Seed database if fresh installation
if [ "$2" == "--seed" ]; then
    echo -e "${YELLOW}Seeding database...${NC}"
    docker-compose exec -T backend npm run seed
fi

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "Backend API: ${GREEN}http://localhost:5000${NC}"
echo -e "MongoDB: ${GREEN}localhost:27017${NC}"
echo ""
echo -e "${YELLOW}Default Credentials:${NC}"
echo "  Admin: admin@fmcs.com / Admin123!"
echo "  Doctor: dr.eeyob@fmcs.com / Doctor123!"
echo "  Lab Tech: lab.tech@fmcs.com / LabTech123!"
echo "  Receptionist: receptionist@fmcs.com / Recept123!"
echo ""
echo -e "${YELLOW}To view logs: docker-compose logs -f${NC}"
echo -e "${YELLOW}To stop: docker-compose down${NC}"
