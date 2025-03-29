import { Request, Response, NextFunction } from 'express';

const discountDBUrl = 'https://api.discountdb.ch/api/v1'

export const searchCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body);
        const { query, sort_by, limit } = req.body;

        if (!query || !sort_by || !limit) {
            throw new Error("missing fields");
        }

        const params = new URLSearchParams({
            q: query,
            sort_by: sort_by,
            limit: limit.toString()
        });

        const url = `${discountDBUrl}/coupons/search?${params.toString()}`;
        console.log(url);

        const response = await fetch(url, {
            method: 'GET'
        }).then((res) => res.json());

        res.json(response);

    } catch (error) {
        next(error);
    }
}