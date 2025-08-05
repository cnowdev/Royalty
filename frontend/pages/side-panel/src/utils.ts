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


/**
 * ensures that only one data point per day is kept, and formats the data for charting
 * 
 * @param pricingData 
 * @returns 
 */
export const formatPricingData = (pricingData: { createdAt: string; price: string }[]): { date: string; price: number }[] => {
          // Process to keep only the most recent entry for each day
      const dayEntryMap = new Map<string, { date: string; price: number; timestamp: number }>();

      pricingData.forEach(entry => {
        const dateObj = new Date(entry.createdAt);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const price = parseFloat(entry.price);
        const timestamp = dateObj.getTime();
        
        // If this date doesn't exist in our map, or if this entry is more recent than what we have
        if (!dayEntryMap.has(dateStr) || timestamp > dayEntryMap.get(dateStr)!.timestamp) {
          dayEntryMap.set(dateStr, { date: dateStr, price, timestamp });
        }
      });

      // Convert map back to array and sort by timestamp
      let priceHistoryData = Array.from(dayEntryMap.values())
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ date, price }) => ({ date, price }));

      if (priceHistoryData.length > 0) {
        const lastPrice = priceHistoryData[priceHistoryData.length - 1].price;
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Only add today if it's not already there
        if (!dayEntryMap.has(today)) {
          priceHistoryData.push({ date: today, price: lastPrice });
        }
      }

    return priceHistoryData;
}