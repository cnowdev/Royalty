import { Coupon } from './utils/shared-types.js'
import { couponCacheStorage } from '@extension/storage';

/**
 * API Helper class
 * 
 * Used for data caching and provides methods for interacting with the API.
 */
class API {
    private baseUrl: string = process.env.CEB_API_URL || 'http://localhost:3000';

    async searchCoupons(query: string, sort_by: string = 'newest', limit: number = 10): Promise<Coupon[]> {
        let cache = await couponCacheStorage.get();

        if(cache[query] && cache[query].timestamp > Date.now() - 5 * 60 * 1000) { // Cache for 5 minutes
            console.log(`Returning cached coupons for query: ${query}`);
            return cache[query].data;
        }
        const params = new URLSearchParams({
            query: query,
            sort_by: sort_by,
            limit: limit.toString()
          });
  

        const url = `${this.baseUrl}/coupons/search?${params.toString()}`;

        interface ApiResponse {
            data: Coupon[];
          }
  
        const response: ApiResponse = await fetch(url, {
            method: 'GET'
        }).then((res) => res.json());

        if (!response || !response.data) {
            throw new Error('Failed to fetch coupons');
        }

        console.log(cache);
        cache[query] = {
            data: response.data,
            timestamp: Date.now() // Update the timestamp to the current time
        }
        couponCacheStorage.set(cache);

        return response.data
    }
}

export const APIClient = new API();