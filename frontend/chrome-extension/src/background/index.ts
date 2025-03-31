import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    console.log('Opening side panel...');
    chrome.tabs.query({ active: true, currentWindow: true, lastFocusedWindow: true}, (tabs) => {
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
  } else{
    return;
  }
});
