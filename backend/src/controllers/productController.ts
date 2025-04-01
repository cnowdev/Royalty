import { Request, Response, NextFunction, response } from 'express';
import prisma from '@/lib/prismaClient';

export const getRetailerProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productURL } = req.query;

        const response = await getPriceComProductFromURL(productURL as string);
        if(!response) throw new Error("No product found for URL");

        console.log("Price.com response: ", response);


        const retailerName = response.retailer;
        const retailerProductID = response.productIdentifier.sku;


        if(!retailerName || !retailerProductID || typeof retailerName !== 'string' || typeof retailerProductID !== 'string') {
            throw new Error("Invalid retailerName or retailerProductID");
        }
    
        const retailerProduct = await prisma.retailerProduct.findFirst({
            where: {
                retailerName: retailerName, retailerProductId: retailerProductID
            },
            include: {
                product: true,
            },
        });
    
        //if no retailerProduct is found, or the data is stale, create or update the product using the productURL
        if(!retailerProduct || retailerProduct.createdAt.getTime() < Date.now() - 1000 * 60 * 60 * 12) {
            if(!productURL) throw new Error("No retailer product found and no product URL provided");

            const objectID = response.ObjectId
            if(!objectID) throw new Error("No objectID found for product URL");

            await createOrUpdateProduct(objectID);

            const updatedRetailerProduct = await prisma.retailerProduct.findFirst({
                where: {
                    retailerName: retailerName, retailerProductId: retailerProductID
                },
                include: {
                    product: true,
                },
            });


            res.json(updatedRetailerProduct);

            return;
        }


        res.json(retailerProduct);


    } catch (error) {
        next(error);
    }
    
}

export const getRetailerProductPricingData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { retailerName, retailerProductID } = req.query;

        if (!retailerName || typeof retailerName !== 'string' || !retailerProductID) {
            throw new Error("Invalid objectId parameter");
        }

        const retailerProducts = await prisma.retailerProduct.findMany({
            where: {
                retailerName: retailerName as string,
                retailerProductId: retailerProductID as string,
            },
        });

        if (!retailerProducts) {
            throw new Error("Retailer products not found");
        }

        res.json(retailerProducts);
    } catch (error) {
        next(error);
    }
}

export const getRelatedProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { objectId } = req.query;

        if (!objectId || typeof objectId !== 'string') {
            throw new Error("Invalid objectId parameter");
        }

        const product = await prisma.product.findUnique({
            where: { objectId },
            include: {
                retailerProducts: true,
            },
        });

        if (!product) {
            throw new Error("Product not found");
        }

        // Filter to get the latest retailerProduct for each retailerName
        const latestRetailerProducts = Object.values(
            product.retailerProducts.reduce((acc, retailerProduct) => {
                const retailerName = retailerProduct.retailerName;
                if (
                    !acc[retailerName] || 
                    new Date(retailerProduct.createdAt).getTime() > new Date(acc[retailerName].createdAt).getTime()
                ) {
                    acc[retailerName] = retailerProduct;
                }
                return acc;
            }, {} as Record<string, typeof product.retailerProducts[0]>)
        );
        res.json(latestRetailerProducts);
    } catch (error) {
        next(error);
    }
};

const priceComAPIURL = 'https://matchos.price.com/apiv2'

/**
 * gets the product by product ID, then refreshes all retailerProducts linked to that product.
 * 
 * @param productID 
 */
const createOrUpdateProduct = async (objectID: string): Promise<void> => {
    const matches = await getRelatedProductsFromObjectID(objectID);

    const product = await prisma.product.upsert({
        where: {
            objectId: objectID,
        },
        update: {
            lastUpdated: new Date(),
        },
        create: {
            objectId: objectID,
            lastUpdated: new Date(),
        }
    });

    await Promise.all(matches.flatMap(async(match: any) => {
        if (match.retailer.toLowerCase() == 'ebay') {
            return [];
        } 
        try {    
            await prisma.retailerProduct.create({
                data: {
                    price: match.price,
                    retailerName: match.retailer,
                    retailerProductId: match.productIdentifier.sku,
                    retailerProductUrl: match.productUrl,
                    description: match.productDescription ?? null,
                    name: match.productName ?? null,
                    productId: product.id,
                    createdAt: new Date(),
                    imageUrl: match.imageUrl ?? null
                }
            });
        } catch (err) {
            console.error(`failed to create retailer product for match: ${JSON.stringify(match)}`, err);
        }

    }))
}

/**
 * gets products related to the current product with a given object ID
 * 
 * @param objectID 
 */
const getRelatedProductsFromObjectID = async (objectID: string): Promise<any> => {
    //https://matchos.price.com/apiv2/match_recommend?partner=5b960a4ade2962062eeb1f4a&url=https%3A%2F%2Fwww.macys.com%2Fshop%2Fproduct%2Fpokemon-pikachu-train-play-deluxe-interactive-action-figure%3FID%3D16426527

    const params = new URLSearchParams({
        partner: '5b960a4ade2962062eeb1f4a',
        objectId: objectID as string,
    });

    const response = await fetch(`${priceComAPIURL}/match_recommend?${params.toString()}`, {
        method: 'GET'
    }).then(response => response.json());

    return response.matches;
}

/**
 * get the objectID of a product from a given URL using the price.com API.
 * 
 * @param url
 */
const getPriceComProductFromURL = async (url: string): Promise<any | null> => {
    //https://matchos.price.com/apiv2/item?partner=5b960a4ade2962062eeb1f4a&url=https%3A%2F%2Fwww.amazon.com%2Fdp%2FB07RBBCZZ1%3Ftag%3Dsnx639-20%26th%3D1

    const params = new URLSearchParams({
        partner: '5b960a4ade2962062eeb1f4a',
        url: url as string,
    });

    const response = await fetch(`${priceComAPIURL}/item?${params.toString()}`, {
        method: 'GET'
    }).then(response => response.json());

    if(!response || response.length === 0 || !response[0].ObjectId) {
        throw new Error("No objectID found in response");
    }

    return response[0];
}