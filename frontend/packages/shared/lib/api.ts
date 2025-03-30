import { Coupon } from './utils/shared-types.js'
import { couponCacheStorage } from '@extension/storage';

/**
 * API Helper class
 * 
 * Used for data caching and provides methods for interacting with the API.
 */
class API {
    private baseUrl: string = process.env.CEB_API_URL || 'http://localhost:3000';

    /**
     * Method that searches for coupons
     * 
     * @param query The search query for coupons. This should be the domain of the website
     * @param sort_by The sorting method for the coupons. Can be 'newest', 'oldest', 'high_score', or 'low_score'
     * @param limit The number of items per page
     * @returns A list of Coupon objects
     */
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

        if (!response) {
            throw new Error('Failed to fetch coupons');
        }

        if(!response.data || response.data.length === 0) {
            throw new Error(`No coupons found for: ${query}`);
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