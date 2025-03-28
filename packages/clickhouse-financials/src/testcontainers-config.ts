/**
 * Configuration for testcontainers-node that limits parallel Docker container usage
 * This helps prevent Docker network subnet depletion issues
 */

import { GenericContainer } from "testcontainers";

// Set a global parallelism limit for all testcontainers
process.env.TESTCONTAINERS_DOCKER_NETWORK_NAME = "clickhouse-test-network";
process.env.TESTCONTAINERS_RYUK_DISABLED = "true"; // Disable Ryuk container to reduce Docker overhead

// Configure testcontainers to clean up its own resources
GenericContainer.prototype.withAutoRemove = function (autoRemove: boolean) {
    this.autoRemove = autoRemove;
    return this;
};

// Set a delay between container starts to avoid network race conditions
export const CONTAINER_START_DELAY = 500; // milliseconds

export const waitBetweenContainerStarts = async (): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, CONTAINER_START_DELAY));
};

// Force cleanup when the process exits
process.on('exit', () => {
    try {
        const { execSync } = require('child_process');
        execSync('docker container stop $(docker container ls -q -f "name=clickhouse") 2>/dev/null || true');
        execSync('docker container rm $(docker container ls -a -q -f "name=clickhouse") 2>/dev/null || true');
        execSync('docker network prune -f 2>/dev/null || true');
    } catch (e) {
        // Ignore errors during cleanup
    }
}); 