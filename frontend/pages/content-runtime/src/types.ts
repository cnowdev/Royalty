declare global {
    interface Window {
        couponAutoApplyListenerAttached?: boolean;
        hasCouponAutoApplyListener?: boolean;
    }
}

export interface SiteConfig {
    inputSelector: string;
    submitSelector: string;
    successSelector?: string;
    errorSelector?: string;
    waitMs?: number;
    clearInputOnError?: boolean;
}

export interface RequestPayload {
    type: string;
    payload?: {
        domain: string;
        codes: string[];
    };
}

export {}