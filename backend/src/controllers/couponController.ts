import prisma from '@/lib/prismaClient';
import { Request, Response, NextFunction } from 'express';

export const searchCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { retailerUrl, limit } = req.query;

        if (!retailerUrl || !limit) {
            throw new Error("missing fields");
        }

        const response = await prisma.coupon.findMany({
            where: {
                retailerUrl: retailerUrl as string,
                expirationDate: {
                    gte: new Date(),
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: parseInt(limit as string, 10) || 10,
        })

        res.json(response);

    } catch (error) {
        next(error);
    }
}