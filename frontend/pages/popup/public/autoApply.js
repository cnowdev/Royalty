// popup/autoApply.js

// Use a flag attached to the window object to ensure the listener is added only once per page context
if (typeof window.couponAutoApplyListenerAttached === 'undefined') {
    window.couponAutoApplyListenerAttached = true; // Set the flag immediately

    console.log("Attaching Coupon Auto-Apply Listener");

    const siteConfigs = {
        "example.com": { inputSelector: "#coupon-code-input", submitSelector: "button.apply-coupon-button", successSelector: ".coupon-success-message.visible", errorSelector: ".coupon-error-message[style*='display: block']", waitMs: 2500, clearInputOnError: true },
        "shopify.com": { inputSelector: "#checkout_reduction_code", submitSelector: "button[name='button'][data-trekkie-id='apply_discount_button']", successSelector: ".reduction-code__text", errorSelector: ".field__message--error", waitMs: 3000 },
        // Add your other site configurations here
    };


    function setInputValue(input, value) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
    }
    
    function clickElement(element) {
        element.click();
    }
    
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    function isElementUsable(element) {
        if (!element || element.offsetParent === null) return false;
        if ('disabled' in element && element.disabled) return false;
        return true;
    }
    
    function checkResult(config) {
        if (config.errorSelector) {
            const errorElement = document.querySelector(config.errorSelector);
            if (errorElement && isElementUsable(errorElement)) {
                const errorText = errorElement.textContent?.toLowerCase() || "";
                if (errorText.includes('invalid') || errorText.includes('expired') || errorText.includes('not valid') || errorText.includes('minimum') || errorText.includes('unable to apply')) {
                    console.log("[AutoApply] Detected error message:", errorElement.textContent);
                    return 'ERROR';
                }
            }
        }
    
        if (config.successSelector) {
            const successElement = document.querySelector(config.successSelector);
            if (successElement && isElementUsable(successElement)) {
                console.log("[AutoApply] Detected success indicator:", successElement.textContent);
                return 'SUCCESS';
            }
        }
    
        console.log("[AutoApply] Could not determine result from configured selectors.");
        return 'UNKNOWN';
    }
    
    
    // --- attemptApplyForSite Function ---
    // ... (Keep this function as it is) ...
    async function attemptApplyForSite(domain, codes, sendResponse) {
        console.log(`[AutoApply] Attempting for domain: ${domain} with ${codes.length} codes.`);
    
        // Moved siteConfigs inside so it's defined before use if script runs multiple times
        // Though with the listener guard, this isn't strictly necessary anymore
        const siteConfigs = {
            "codecademy.com": {
                inputSelector: "input[data-testid=promo-input]",
                submitSelector: "button[data-testid=promo-code-submit]",
                successSelector: ".e8i0p5k0", // Check this selector carefully
                errorSelector: ".egb3lhk0",   // Check this selector carefully
                waitMs: 1000,
            },
             // Add other site configs here
        };
        console.log("[AutoApply] Domain:", domain);
        const config = siteConfigs[domain];
    
        console.log("[AutoApply] Config:", config);
    
        if (!config) {
            sendResponse({ success: false, message: `Site (${domain}) not configured.` });
            return;
        }
    
        if (domain == "codecademy.com") {
            let button = document.querySelector("#promo-button")
            if (button && button.getAttribute("aria-expanded") == "false") {
                button.click();
                await delay(500);
            }
        }

        const inputField = document.querySelector(config.inputSelector);
        const submitButton = document.querySelector(config.submitSelector);


        if (!inputField) {
            console.error(`[AutoApply] Input field not found: ${config.inputSelector}`);
            sendResponse({ success: false, message: `Error: Input field not found: "${config.inputSelector}"` });
            return;
        }
        if (!isElementUsable(inputField)) {
            console.error(`[AutoApply] Input field not usable: ${config.inputSelector}`);
            sendResponse({ success: false, message: `Error: Input field not usable.` });
            return;
        }
        if (!submitButton) {
            console.error(`[AutoApply] Submit button not found: ${config.submitSelector}`);
            sendResponse({ success: false, message: `Error: Submit button not found: "${config.submitSelector}"` });
            return;
        }
        
    
        console.log("[AutoApply] Found elements:", { inputField, submitButton });

        for (const code of codes) {
            console.log(`[AutoApply] Attempting code: ${code}`);
            setInputValue(inputField, code);
            await delay(150);

            if (!isElementUsable(submitButton)) {
                sendResponse({ success: false, message: `Error: Submit button not usable.` });
                return;
            }
    
            clickElement(submitButton);
    
            const waitTime = config.waitMs || 2000;
            console.log(`[AutoApply] Waiting ${waitTime}ms...`);
            await delay(waitTime);
    
            const resultStatus = checkResult(config);
    
            if (resultStatus === 'SUCCESS') {
                console.log(`[AutoApply] Success: ${code}`);
                sendResponse({ success: true, appliedCode: code, message: `Successfully applied: ${code}` });
                return;
            } else if (resultStatus === 'ERROR') {
                 console.log(`[AutoApply] Error detected for: ${code}`);
                 if (config.clearInputOnError) {
                     setInputValue(inputField, '');
                     await delay(100);
                 }
            } else {
                console.log(`[AutoApply] Result unknown for: ${code}. Continuing...`);
            }
    
            await delay(300); // Delay between attempts
        }
    
        console.log("[AutoApply] All codes tried, none confirmed successful.");
        sendResponse({ success: false, message: "Tried all codes, none confirmed successful." });
    }
    
    
    // --- Add Message Listener ONLY ONCE ---
    // Use a flag to ensure the listener is only added the first time the script runs in a context
    if (!window.hasCouponAutoApplyListener) {
        console.log('[AutoApply] Adding message listener.');
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('[AutoApply] Message received:', request); // Log when message received
            if (request.type === "AUTO_APPLY_COUPONS") {
                if (!request.payload?.domain || !request.payload?.codes) {
                    console.error("[AutoApply] Invalid payload:", request.payload);
                    sendResponse({ success: false, message: "Error: Invalid data from extension." });
                    return false; // Explicitly return false for sync response
                }
    
                // Call the async function
                attemptApplyForSite(request.payload.domain, request.payload.codes, sendResponse)
                    .catch(error => {
                        console.error("[AutoApply] Error in attemptApplyForSite:", error);
                        // Ensure a response is sent even if the promise rejects
                        sendResponse({ success: false, message: `Script error: ${error.message || 'Unknown error'}` });
                    });
    
                // Return true to indicate you WILL send a response asynchronously
                return true;
            }
            // Optional: Handle other message types or return false if not handled
            // return false; // If not handling this message type
        });
    
        // Set the flag to true after adding the listener
        window.hasCouponAutoApplyListener = true;
    } else {
         console.log('[AutoApply] Listener already added, skipping.');
    }
}