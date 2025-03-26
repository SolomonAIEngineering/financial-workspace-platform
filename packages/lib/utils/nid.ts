import { alphabet, generateRandomString } from 'oslo/crypto';

function generateId(length: number): string {
    return generateRandomString(length, alphabet('0-9', 'a-z'));
}

/**
 * Generates a unique identifier with an optional prefix. Use custom alphabet
 * without special chars for less chaotic, copy-able URLs Will not collide for a
 * long time: https://zelark.github.io/nano-id-cc/
 */
export const nid = () => {
    return generateId(15);
};
