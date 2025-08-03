import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

export function hmacHandler(req: Request, res: Response, next: NextFunction) {
    const apiKey = process.env.CEB_API_KEY || '';
    if (!apiKey) {
        throw new Error("API key is not set");
    }

    console.log('api key: ', apiKey);

    const hashedApiKey = req.headers['x-hashed-api-key'] as string;
    const randomString = req.headers['x-random-string'] as string;

    if (!verifySha256Hash(hashedApiKey, apiKey, randomString)) {
        throw new Error("Not authorized");
    }

    next();
}

function verifySha256Hash(hash: string, key: string, timestamp: string): boolean {
    const ts = parseInt(timestamp, 10);
    const now = Math.floor(Date.now());

    const tolerance_ms: number = 60 * 1000;

    const timeDifference = Math.abs(now - ts)
    if (isNaN(ts) || timeDifference > tolerance_ms) {
        return false;
    }
    const data = key + timestamp;
    const computedHash = createHash('sha256').update(data).digest('hex');

    return computedHash === hash;
}