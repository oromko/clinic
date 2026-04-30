#!/bin/bash

# FMCS Database Backup Script
# Usage: ./backup.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/fmcs-backup-${TIMESTAMP}.bson"

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  FMCS Database Backup${NC}"
echo -e "${GREEN}=====================================${NC}"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

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

echo -e "${YELLOW}Starting backup...${NC}"
echo -e "Backup file: ${BACKUP_FILE}"

# Perform backup using mongodump
docker-compose exec -T mongodb mongodump --db fmcs --archive > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
    # Compress the backup
    gzip ${BACKUP_FILE}
    
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}  Backup Successful!${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo ""
    echo -e "Backup location: ${GREEN}${BACKUP_FILE}.gz${NC}"
    echo -e "Backup size: $(ls -lh ${BACKUP_FILE}.gz | awk '{print $5}')"
    echo ""
    echo -e "${YELLOW}To restore:${NC}"
    echo "  ./restore.sh ${BACKUP_FILE}.gz"
else
    echo -e "${RED}Backup failed!${NC}"
    exit 1
fi
