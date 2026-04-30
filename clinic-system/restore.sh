#!/bin/bash

# FMCS Database Restore Script
# Usage: ./restore.sh <backup-file>

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Error: Backup file not specified${NC}"
    echo "Usage: ./restore.sh <backup-file.gz>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  FMCS Database Restore${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${YELLOW}Warning: This will overwrite the current database!${NC}"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

# Check if Docker is running
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: docker-compose is not installed${NC}"
    exit 1
fi

# Get MongoDB container name
MONGO_CONTAINER=$(docker-compose ps -q mongodb)

if [ -z "$MONGO_CONTAINER" ]; then
    echo -e "${RED}Error: MongoDB container is not running${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting restore...${NC}"
echo -e "Backup file: ${BACKUP_FILE}"

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}Decompressing backup...${NC}"
    gunzip -c "$BACKUP_FILE" | docker-compose exec -T mongodb mongorestore --db fmcs --archive
else
    docker-compose exec -T mongodb mongorestore --db fmcs --archive < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}  Restore Successful!${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo ""
    echo -e "${YELLOW}Please restart the backend service to apply changes:${NC}"
    echo "  docker-compose restart backend"
else
    echo -e "${RED}Restore failed!${NC}"
    exit 1
fi
