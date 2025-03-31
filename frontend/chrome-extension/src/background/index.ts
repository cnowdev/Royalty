import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';
import { APIClient } from '@extension/shared';
import { getCurrentTab, getDomain } from '../../../pages/popup/src/utils';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    (async () => {
      console.log("Before coupon fetch");
      const currentURL = await getCurrentTab().then(url => getDomain(url));
      console.log("current url: " + currentURL);

      const validTLDs = ['.com', '.org', '.net', '.edu', '.gov', '.io', '.co', '.us', '.uk', '.ca', '.au', '.in'];
      const hasValidTLD = validTLDs.some(tld => currentURL.endsWith(tld));
      if (!hasValidTLD) {
        console.error("Invalid domain for coupons:", currentURL);
        return;
      }

      try {
        let coupons = await APIClient.searchCoupons(currentURL, 'newest', 10);
        console.log("coupons: ", coupons);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    })();
  }
});

console.log('Background loaded!');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    console.log('Opening side panel...');
    chrome.tabs.query({ active: true, currentWindow: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id !== undefined) {
        const tabId = tabs[0].id;
        chrome.sidePanel.setOptions({
          path: 'side-panel/index.html',
          enabled: true,
          tabId: tabId,
        });

        chrome.sidePanel.open({
          tabId: tabId
        }).then(() => {
          sendResponse({ success: true });
        }).catch(error => {
          console.error('Failed to open side panel:', error);
          sendResponse({ success: false, error: error.message });
        });
      } else {
        console.error('No active tab found or tab ID is undefined');
        sendResponse({ success: false, error: 'No active tab found or tab ID is undefined' });
      }
    });

    return true;
  } else {
    return;
  }
});
