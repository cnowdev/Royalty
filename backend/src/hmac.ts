import { createHash } from 'crypto';

/**
 * Verifies if the SHA-256 hash of (key + str) matches the provided hash.
 * @param hash - The expected SHA-256 hash (hex string).
 * @param key - The key to prepend.
 * @param str - The string to append.
 * @returns True if the computed hash matches the provided hash, false otherwise.
 */
export function verifySha256Hash(hash: string, key: string, str: string): boolean {
    const data = key + str;
    const computedHash = createHash('sha256').update(data).digest('hex');
    return computedHash === hash;
}