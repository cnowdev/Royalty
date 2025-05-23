import { Request, Response, NextFunction } from 'express';

const discountDBUrl = 'https://api.discountdb.ch/api/v1'

export const searchCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query, sort_by, limit } = req.query;

        if (!query || !sort_by || !limit) {
            throw new Error("missing fields");
        }

        const params = new URLSearchParams({
            q: query as string,
            sort_by: sort_by as string,
            limit: limit as string
        });

        const url = `${discountDBUrl}/coupons/search?${params.toString()}`;

        const response = await fetch(url, {
            method: 'GET'
        }).then((res) => res.json());

        res.json(response);

    } catch (error) {
        next(error);
    }
}