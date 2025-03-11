import { describe, expect, test } from 'vitest';
import { generateUUID, getCurrentTimestamp } from './utils';

describe('Recurring Transactions Utils', () => {
    describe('generateUUID', () => {
        test('should generate a valid UUID v4 string', () => {
            // Generate a UUID
            const uuid = generateUUID();

            // Validate the format
            expect(uuid).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            );
        });

        test('should generate unique UUIDs', () => {
            // Generate multiple UUIDs
            const uuids = new Set();
            for (let i = 0; i < 100; i++) {
                uuids.add(generateUUID());
            }

            // Expect all UUIDs to be unique
            expect(uuids.size).toBe(100);
        });
    });

    describe('getCurrentTimestamp', () => {
        test('should return a valid ISO datetime string', () => {
            // Get current timestamp
            const timestamp = getCurrentTimestamp();

            // Validate that it's an ISO datetime string
            expect(timestamp).toMatch(
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
            );

            // Validate that it's close to the current time
            const now = new Date();
            const timestampDate = new Date(timestamp);
            const timeDifference = Math.abs(now.getTime() - timestampDate.getTime());

            // Difference should be less than a second
            expect(timeDifference).toBeLessThan(1000);
        });

        test('should return a parseable date', () => {
            const timestamp = getCurrentTimestamp();
            const date = new Date(timestamp);

            // Should not be Invalid Date
            expect(date.toString()).not.toBe('Invalid Date');
        });
    });
}); 