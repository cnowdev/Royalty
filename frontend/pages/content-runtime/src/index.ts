declare global {
    interface Window {
        couponAutoApplyListenerAttached?: boolean;
        hasCouponAutoApplyListener?: boolean;
    }
}

interface SiteConfig {
    inputSelector: string;
    submitSelector: string;
    successSelector?: string;
    errorSelector?: string;
    waitMs?: number;
    clearInputOnError?: boolean;
}

interface RequestPayload {
    type: string;
    payload?: {
        domain: string;
        codes: string[];
    };
}

if (typeof window.couponAutoApplyListenerAttached === 'undefined') {
    window.couponAutoApplyListenerAttached = true;

    function setInputValue(input: HTMLInputElement, value: string): void {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
    }

    function clickElement(element: HTMLElement): void {
        element.click();
    }

    function delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function isElementUsable(element: HTMLElement | null): boolean {
        if (!element || element.offsetParent === null) return false;
        if ('disabled' in element && (element as HTMLInputElement).disabled) return false;
        return true;
    }

    function checkResult(config: SiteConfig): 'SUCCESS' | 'ERROR' | 'UNKNOWN' {
        if (config.errorSelector) {
            const errorElement = document.querySelector(config.errorSelector);
            if (errorElement && isElementUsable(errorElement as HTMLElement)) {
                const errorText = errorElement.textContent?.toLowerCase() || "";
                if (errorText.includes('invalid') || errorText.includes('expired') || errorText.includes('not valid') || errorText.includes('minimum') || errorText.includes('unable to apply')) {
                    console.log("[AutoApply] Detected error message:", errorElement.textContent);
                    return 'ERROR';
                }
            }
        }

        if (config.successSelector) {
            const successElement = document.querySelector(config.successSelector);
            if (successElement && isElementUsable(successElement as HTMLElement)) {
                console.log("[AutoApply] Detected success indicator:", successElement.textContent);
                return 'SUCCESS';
            }
        }

        console.log("[AutoApply] Could not determine result from configured selectors.");
        return 'UNKNOWN';
    }

    async function attemptApplyForSite(domain: string, codes: string[], sendResponse: (response: any) => void): Promise<void> {
        console.log(`[AutoApply] Attempting for domain: ${domain} with ${codes.length} codes.`);

        const siteConfigs: Record<string, SiteConfig> = {
            "codecademy.com": {
                inputSelector: "input[data-testid=promo-input]",
                submitSelector: "button[data-testid=promo-code-submit]",
                successSelector: ".e8i0p5k0",
                errorSelector: ".egb3lhk0",
                waitMs: 750,
            },
            "target.com": {
                inputSelector: "#promoCodeEntry",
                submitSelector: "button[data-test=apply-promo-code-button]",
                successSelector: ".e8i0p5k0",
                errorSelector: "#promoCodeEntry--ErrorMessage",
                waitMs: 750,
            },
            "costco.com": {
                inputSelector: "#enter-promo-code-input",
                submitSelector: "#apply-promo-code > input",
                successSelector: ".e8i0p5k0",
                errorSelector: "#promo-code-error > p.sr-only",
                waitMs: 750,
            },
            "amazon.com": {
                inputSelector: "#spc-gcpromoinput",
                submitSelector: "input[aria-labelledby=gcApplyButtonId-announce]",
                successSelector: ".e8i0p5k0",
                errorSelector: "#addPromo_BadCode",
                waitMs: 750,
            },
            "michaels.com": {
                inputSelector: "#promoCode",
                submitSelector: "button[formid=promo-code]",
                successSelector: ".e8i0p5k0",
                errorSelector: ".conpon-error-item",
                waitMs: 750,
            },
            "skillshare.com": {
                inputSelector: "input[data-testid=coupon-input]",
                submitSelector: "button[data-testid=coupon-button]",
                successSelector: ".sk-mt-1.sk-text-text-medium.sk-font-bold.sk-italic.sk-text-accent",
                errorSelector: "div[data-testid=coupon-error]",
                waitMs: 750,
            },
            "kohls.com": {
                inputSelector: "input[name=promoCode]",
                submitSelector: "button[title=Add]",
                successSelector: ".manual-entry-success-msg",
                errorSelector: "",
                waitMs: 750,
            },
            "gap.com": {
                inputSelector: "#promo-code-input",
                submitSelector: "#apply-promo-code-button",
                successSelector: ".manual-entry-success-msg",
                errorSelector: ".text-cb-textColor-error.cb-base-note.mt-1 h-auto",
                waitMs: 750,
            },
        };

        const config = siteConfigs[domain];

        if (!config) {
            sendResponse({ success: false, message: `Site (${domain}) not configured.` });
            return;
        }

        if (domain === "codecademy.com") {
            const button = document.querySelector<HTMLButtonElement>("#promo-button");
            if (button && button.getAttribute("aria-expanded") === "false") {
                button.click();
                await delay(500);
            }
        }

        if (domain === "target.com") {
            const button = document.querySelector<HTMLButtonElement>("button[data-test=add-promo-code-btn]");
            if (button) {
                button.click();
                await delay(500);
            }
        }

        if (domain === "michaels.com") {
            let testinputField = document.querySelector<HTMLInputElement>(config.inputSelector);
            if(!testinputField) {
                const button = document.querySelector<HTMLButtonElement>(".css-1c7c9ch");
                if (button) {
                    button.click();
                    await delay(500);
                    
                }
            }
        }

        if (domain === "kohls.com") {
            let testinputField = document.querySelector<HTMLInputElement>(config.inputSelector);
            if(!testinputField) {
                const button = document.querySelector<HTMLButtonElement>(".open-offers-block");
                if (button) {
                    button.click();
                    await delay(500);
                    
                }
            }
        }

        for (const code of codes) {
            const inputField = document.querySelector<HTMLInputElement>(config.inputSelector);
            const submitButton = document.querySelector<HTMLButtonElement>(config.submitSelector);

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

            console.log(`[AutoApply] Attempting code: ${code}`);
            setInputValue(inputField, code);
            await delay(150);

            // if (!isElementUsable(submitButton)) {
            //     sendResponse({ success: false, message: `Error: Submit button not usable.` });
            //     return;
            // }

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

            await delay(300);
        }

        console.log("[AutoApply] All codes tried, none confirmed successful.");
        sendResponse({ success: false, message: "NO_CODES" });
    }

    if (!window.hasCouponAutoApplyListener) {
        console.log('[AutoApply] Adding message listener.');
        chrome.runtime.onMessage.addListener((request: RequestPayload, sender, sendResponse) => {
            console.log('[AutoApply] Message received:', request);
            if (request.type === "AUTO_APPLY_COUPONS") {
                if (!request.payload?.domain || !request.payload?.codes) {
                    console.error("[AutoApply] Invalid payload:", request.payload);
                    sendResponse({ success: false, message: "Error: Invalid data from extension." });
                    return false;
                }

                attemptApplyForSite(request.payload.domain, request.payload.codes, sendResponse)
                    .catch(error => {
                        console.error("[AutoApply] Error in attemptApplyForSite:", error);
                        sendResponse({ success: false, message: `Script error: ${error.message || 'Unknown error'}` });
                    });

                return true;
            }
        });
        window.hasCouponAutoApplyListener = true;
    } else {
        console.log('[AutoApply] Listener already added, skipping.');
    }
}

export {}; // Ensure this file is treated as a module.