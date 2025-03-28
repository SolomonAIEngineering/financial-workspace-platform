#!/bin/bash

echo "⚠️  WARNING: This script will completely reset Docker on your Mac system ⚠️"
echo "All containers, networks, volumes, and images will be removed"
echo "Press ENTER to continue or CTRL+C to abort"
read

# Stop Docker Desktop if running
echo "Stopping Docker Desktop..."
osascript -e 'quit app "Docker Desktop"' || true
echo "Waiting for Docker to fully stop..."
sleep 5

# Force cleanup all resources
echo "Force removing all containers..."
docker rm -f $(docker ps -aq) 2>/dev/null || true

echo "Force removing all networks..."
docker network rm $(docker network ls -q) 2>/dev/null || true

echo "Pruning all volumes..."
docker volume prune -f || true

echo "Pruning entire Docker system..."
docker system prune -af --volumes || true

# Remove Docker network configuration files
echo "Removing Docker network configuration files..."
rm -rf ~/Library/Containers/com.docker.docker/Data/com.docker.driver.amd64-linux/network 2>/dev/null || true

# Reset Docker's internal state
echo "Removing Docker internal state..."
rm -rf ~/Library/Containers/com.docker.docker/Data/vms 2>/dev/null || true
rm -rf ~/Library/Containers/com.docker.docker/Data/vm 2>/dev/null || true

echo "Restarting Docker Desktop..."
open -a "Docker Desktop"
echo "Waiting for Docker to restart (30 seconds)..."
sleep 30

echo "Docker reset completed. You should now be able to run tests without network subnet issues."
echo "If the problem persists, you may need to restart your computer and then run this script again." 