#!/bin/bash

# Exit on error
set -e

# Function to check remote repositories
check_remote() {
    echo "Checking remote repositories..."
    git remote -v
}

# Function to add upstream if it doesn't exist
add_upstream() {
    echo "Checking for upstream remote..."
    if ! git remote | grep -q "upstream"; then
        echo "Adding upstream remote..."
        git remote add upstream https://github.com/plate-plus/potion.git
        echo "Upstream remote added successfully"
    else
        echo "Upstream remote already exists"
    fi
}

# Function to update from upstream main branch
update_from_template() {
    echo "Pulling and merging changes from upstream main branch..."
    git pull upstream main --allow-unrelated-histories
}

# Main execution
echo "Starting upstream sync process..."
check_remote
add_upstream
update_from_template
echo "Sync process completed"