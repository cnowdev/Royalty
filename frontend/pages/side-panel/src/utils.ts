/**
 * takes the retailername and returns the display name
 * 
 * @param retailerName 
 */
export const getRetailerDisplayName = (retailerName: string): string => {
    //this is for special cases where the retailer name is not the same as the display name (ex: It's two words, or has a special character)
    const names: any = {
        "farmandfleet": "Farm & Fleet",
        "riteaid": "Rite Aid",
        'stockx': 'StockX'
    }

    return names[retailerName] || retailerName.charAt(0).toUpperCase() + retailerName.slice(1);
}

export const getRetailerLogo = (retailerName: string): string | null => {
    //get logo svg from ../public/logos/${retailerName}.svg

    const logos = ['amazon', 'stockx', 'target', 'walmart', 'walgreens'];

    if(!logos.includes(retailerName)) {
        return null;
    }

    const logo = `side-panel/logos/${retailerName}.jpeg`;
    return logo;
}