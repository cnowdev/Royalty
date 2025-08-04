import prisma from "@/lib/prismaClient";

export const updateStaleProducts = async () => {
    try {
        console.log("Starting stale products update...");
        
        const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);
        const staleProducts = await prisma.product.findMany({
            where : {
                lastUpdated: {
                    lt: oneDayAgo
                }
            },
            select: {
                id: true,
                objectId: true,
                lastUpdated: true,
            }
        });

        console.log(`Found ${staleProducts.length} stale products to update`);

        const BATCH_SIZE = 5;
        for(let i = 0; i < staleProducts.length; i += BATCH_SIZE) {
            const batch = staleProducts.slice(i, i + BATCH_SIZE);

            await Promise.allSettled(batch.map(async (product) => {
                try{
                    console.log(`Updating product with ID: ${product.id}`);
                    await createOrUpdateProduct(product.objectId);
                    console.log(`Successfully updated product with ID: ${product.id}`);
                } catch (error) {
                    console.error(`Failed to update product with ID: ${product.id}`, error);
                }
            }));

            if (i + BATCH_SIZE < staleProducts.length) {
                console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(staleProducts.length / BATCH_SIZE)}`);
                await new Promise(resolve => setTimeout(resolve, 60000)); // wait 60 seconds
            }
        }

        console.log("Stale products update completed successfully.");
    } catch (error) {
        console.error("Error updating stale products:", error);
    }
}
/**
 * gets the product by object ID, then refreshes all retailerProducts linked to that product.
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

    await Promise.all(matches.flatMap(async (match: any) => {
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


const priceComAPIURL = 'https://matchos.price.com/apiv2'
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
