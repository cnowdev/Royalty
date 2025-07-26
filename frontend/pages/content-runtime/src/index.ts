import { autoApply } from './listeners/autoApply';
import './types'
import { SiteConfig, RequestPayload } from './types';
import { setInputValue, clickElement, delay, isElementUsable, checkResult } from './utils';

if (typeof window.couponAutoApplyListenerAttached === 'undefined') {
    window.couponAutoApplyListenerAttached = true;

    if (!window.hasCouponAutoApplyListener) {
        console.log('[AutoApply] Adding message listener.');
        chrome.runtime.onMessage.addListener((request: RequestPayload, sender, sendResponse) => {
            
            if (request.type === "AUTO_APPLY_COUPONS") {
                return autoApply(request, sendResponse);
            } else {
                return false
            }
        });
        window.hasCouponAutoApplyListener = true;
    } else {
        console.log('[AutoApply] Listener already added, skipping.');
    }
}

export { }; // Ensure this file is treated as a module.