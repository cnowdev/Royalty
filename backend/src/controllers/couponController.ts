import prisma from '@/lib/prismaClient';
import { Request, Response, NextFunction } from 'express';
import { verifySha256Hash } from '@/hmac';

export const searchCoupons = async (req: Request, res: Response, next: NextFunction) => {
    console.log(verifySha256Hash(req.headers["x-hashed-api-key"] as string, process.env.CEB_API_KEY || '', req.headers["x-random-string"] as string))
    try {
        if (!verifySha256Hash(req.headers["x-hashed-api-key"] as string, process.env.CEB_API_KEY || '', req.headers["x-random-string"] as string)) {
            throw new Error("Not authorized");
        }
        const { retailerUrl, limit } = req.query;

        if (!retailerUrl || !limit) {
            throw new Error("missing fields");
        }

        const response = await prisma.coupon.findMany({
            where: {
                retailerUrl: retailerUrl as string,
                OR: [
                    { expirationDate: null },
                    { expirationDate: { gte: new Date() } }
                ]
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: parseInt(limit as string, 10) || 10,
        });

        res.json(response);

    } catch (error) {
        next(error);
    }
}