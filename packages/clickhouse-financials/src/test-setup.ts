/**
 * Global test setup file to configure environment and manage Docker resources
 * Import this at the beginning of test files for consistent container behavior
 */

// Import our testcontainers configuration
import './testcontainers-config';

import { afterAll, beforeAll, vi } from 'vitest';

import { waitBetweenContainerStarts } from './testcontainers-config';

// Make the wait function available in the global scope for tests
(global as any).waitBetweenContainerStarts = waitBetweenContainerStarts;

// Set longer timeout for tests with Docker
vi.setConfig({
    testTimeout: 60000,
});

// Clean up Docker resources before tests if needed
beforeAll(async () => {
    // Run any global setup tasks here
    console.log('Setting up test environment with controlled Docker resource management');

    // Run Docker cleanup script via the child_process module
    try {
        const { execSync } = await import('child_process');
        execSync('./docker-cleanup.sh', { stdio: 'inherit' });
    } catch (error) {
        console.error('Docker cleanup failed:', error);
        // Continue even if cleanup fails
    }
});

// Clean up after all tests
afterAll(async () => {
    console.log('Cleaning up test environment');

    // Perform final Docker cleanup
    try {
        const { execSync } = await import('child_process');
        execSync('./docker-cleanup.sh', { stdio: 'inherit' });
    } catch (error) {
        console.error('Docker cleanup failed:', error);
    }
});

// Add utility function to help with test isolation
export const runIsolatedTest = async (testFn: () => Promise<void>): Promise<void> => {
    try {
        await testFn();
    } catch (error) {
        console.error('Test failed with error:', error);
        throw error;
    } finally {
        // Clean up after this specific test
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to let resources release
    }
}; 