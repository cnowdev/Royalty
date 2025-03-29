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