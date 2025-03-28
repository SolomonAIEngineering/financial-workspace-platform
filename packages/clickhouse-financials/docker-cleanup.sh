#!/bin/bash

echo "Starting thorough Docker cleanup..."

# Force stop all running containers
echo "Stopping all containers with force..."
docker container stop $(docker container ls -aq) 2>/dev/null || true

# Force remove all containers
echo "Removing all containers with force..."
docker container rm -f $(docker container ls -aq) 2>/dev/null || true

# Remove all networks
echo "Pruning networks forcefully..."
docker network prune -f || true

# Remove unused volumes
echo "Pruning volumes..."
docker volume prune -f || true

# General cleanup (images, build cache)
echo "Pruning system..."
docker system prune -f || true

# Reset Docker network settings (MAC specific)
echo "Attempting to reset Docker network settings..."
# Delete libnetwork bridge network interface configurations
rm -rf ~/Library/Containers/com.docker.docker/Data/com.docker.driver.amd64-linux/network 2>/dev/null || true

# Wait for resources to properly release
echo "Waiting for resources to be freed..."
sleep 3

echo "Docker cleanup completed"
exit 0 