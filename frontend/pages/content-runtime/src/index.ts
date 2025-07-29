import { autoApply } from './listeners/autoApply/autoApply';
import './types'
import { RequestPayload } from './types';

console.log('index.ts run')

// Check if the listener has already been added to prevent duplicates
if(!window.hasCouponAutoApplyListener) {
        console.log('[AutoApply] Adding message listener.');
        chrome.runtime.onMessage.addListener((request: RequestPayload, sender, sendResponse) => {
            
            console.log('received message in runtime', request);

            if (request.type === "AUTO_APPLY_COUPONS") {
                chrome.runtime.sendMessage({ type: 'AUTO_APPLY_COUPONS_RECEIVED' });
                return autoApply(request, sendResponse);
            } else {
                return false
            }
        });
        window.hasCouponAutoApplyListener = true;
}

export { };