export type ValueOf<T> = T[keyof T];

export interface Coupon {
    id: number;
    created_at: string;
    code: string;
    title: string;
    description: string;
    discount_value: number;
    discount_type: "PERCENTAGE_OFF" | "FIXED_AMOUNT_OFF" | "BOGO" | "FREE" | string;
    merchant_name: string;
    merchant_url: string;
  }
  
export interface CouponCardProps {
    coupon: Coupon;
    isLight: boolean;
}

export interface Product {
  id: number;
  objectId: string;
  lastUpdated: string; // ISO string format for DateTime
  retailerProducts: RetailerProduct[];
};

export interface RetailerProduct {
  id: number;
  productId: number;
  product: Product;
  name?: string;
  description?: string;
  retailerName: string;
  retailerProductId: string;
  retailerProductUrl: string;
  price: number; // Assuming Decimal is represented as a number on the frontend
  createdAt: string; // ISO string format for DateTime
  imageUrl?: string;
};