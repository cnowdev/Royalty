import { SiteConfig } from './types';

export function setInputValue(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
}

export function clickElement(element: HTMLElement): void {
    element.click();
}

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isElementUsable(element: HTMLElement | null): boolean {
    if (!element || element.offsetParent === null) return false;
    if ('disabled' in element && (element as HTMLInputElement).disabled) return false;
    return true;
}

export function checkResult(config: SiteConfig): 'SUCCESS' | 'ERROR' | 'UNKNOWN' {
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