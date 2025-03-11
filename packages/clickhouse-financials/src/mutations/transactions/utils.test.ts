import { describe, expect, test, vi } from 'vitest';
import { generateUUID, getCurrentTimestamp } from './utils';

describe('Transactions Utils', () => {
    describe('generateUUID', () => {
        test('should generate a valid UUID v4 string', () => {
            const uuid = generateUUID();

            // UUID v4 format regex
            const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

            expect(uuid).toMatch(uuidV4Regex);
        });

        test('should generate unique UUIDs', () => {
            const uuid1 = generateUUID();
            const uuid2 = generateUUID();
            const uuid3 = generateUUID();

            expect(uuid1).not.toEqual(uuid2);
            expect(uuid1).not.toEqual(uuid3);
            expect(uuid2).not.toEqual(uuid3);
        });
    });

    describe('getCurrentTimestamp', () => {
        test('should return a valid ISO datetime string', () => {
            const timestamp = getCurrentTimestamp();

            // ISO datetime format regex
            const isoDatetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

            expect(timestamp).toMatch(isoDatetimeRegex);
        });

        test('should return a parseable date', () => {
            const timestamp = getCurrentTimestamp();
            const date = new Date(timestamp);

            expect(date).toBeInstanceOf(Date);
            expect(date.getTime()).not.toBeNaN();

            // Should be close to current time
            const now = new Date();
            const timeDifference = Math.abs(now.getTime() - date.getTime());

            // Should be less than 1000ms (1 second) difference
            expect(timeDifference).toBeLessThan(1000);
        });
    });
}); 