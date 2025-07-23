import { useEffect } from 'react';
import { matchesProductURL, autoApplyProductURLs } from '@extension/shared';
import { error } from 'console';

export default function App() {

  useEffect(() => {
    console.log("content ui loaded");

    let button: HTMLButtonElement | null = null;
    let messageDiv: HTMLDivElement | null = null;

    const currentTab = window.location.href;
    console.log("Current tab URL:", currentTab);
    console.log("Auto apply product URLs:", autoApplyProductURLs);
    console.log("DIV:", autoApplyProductURLs.some((url) => currentTab.includes(url)));

    if (autoApplyProductURLs.some((url) => currentTab.includes(url))) {
      if (!messageDiv) {
        // Create a container for the shadow root
        const shadowHost = document.createElement("div");
        shadowHost.style.position = "fixed";
        shadowHost.style.top = "10px";
        shadowHost.style.right = "10px";
        shadowHost.style.zIndex = "9999";
        document.body.appendChild(shadowHost);

        // Attach shadow root
        const shadow = shadowHost.attachShadow({ mode: "open" });

        // Create style element for shadow DOM
        const style = document.createElement("style");
        style.textContent = `
      .royalty-message {
        background: #0C2B62;
        color: #fff;
        padding: 20px 5px 20px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-size: 14px;
        font-weight: bold;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        max-width: 300px;
        max-height: 150px;
        position: relative;
      }
      .royalty-close {
        background: transparent;
        color: #fff;
        border: none;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        position: absolute;
        top: 5px;
        right: 10px;
      }
      .royalty-apply {
        background: #217ED1;
        color: #fff;
        border: none;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        padding: 5px 10px;
        border-radius: 5px;
        margin-left: 10px;
      }
      .royalty-error {
        color: #ff4d4f;
        font-size: 12px;
        margin-top: 10px;
        display: none;
      }
    `;
        shadow.appendChild(style);

        // Create message div
        messageDiv = document.createElement("div");
        messageDiv.className = "royalty-message";
        messageDiv.textContent = "Royalty found coupons for this site, would you like to apply them?";

        // Create close button
        const closeButton = document.createElement("button");
        closeButton.className = "royalty-close";
        closeButton.textContent = "X";
        closeButton.addEventListener("click", () => {
          if (shadowHost) {
            document.body.removeChild(shadowHost);
          }
        });

        // Create apply button
        const applyCouponsButton = document.createElement("button");
        applyCouponsButton.className = "royalty-apply";
        applyCouponsButton.textContent = "Apply Coupons";

        applyCouponsButton.addEventListener("click", async () => {
          chrome.runtime.sendMessage({ type: 'AUTO_APPLY_BUTTON_CLICKED' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError.message);
            }

            closeButton.click();

          });
        });

        // Create error text
        const errorText = document.createElement("div");
        errorText.className = "royalty-error";
        errorText.textContent = "An error occurred while applying coupons.";

        // Append elements
        messageDiv.appendChild(closeButton);
        messageDiv.appendChild(applyCouponsButton);
        messageDiv.appendChild(errorText);
        shadow.appendChild(messageDiv);
      }
    } else {
      if (messageDiv) {
        document.body.removeChild(messageDiv);
        messageDiv = null;
      }
    }

    const initializeButton = () => {
      const currentTab = window.location.href;
      if (currentTab && matchesProductURL(currentTab)) {
        if (!button) {
          button = document.createElement("button");
          button.textContent = ""; // Clear text content for logo
          button.style.position = "fixed";
          button.style.top = "50%";
          button.style.right = "1px";
          button.style.transform = "translateY(-50%)";
          button.style.width = "65px";
          button.style.height = "65px"; // Adjust height to fit both logo and text
          button.style.backgroundColor = "#030712";
          button.style.color = "#fff";
          button.style.border = "5px solid #217ED1";
          button.style.borderRadius = "10px";
          button.style.cursor = "pointer";
          button.style.zIndex = "1000";
          button.style.display = "flex";
          button.style.flexDirection = "column"; // Stack children vertically
          button.style.alignItems = "center";
          button.style.justifyContent = "center";
          button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";


          const logo = document.createElement("img");
          logo.src = chrome.runtime.getURL("content-ui/Royalty-Icon.svg");
          logo.style.height = "40px"; // Adjust height to fit the button
          logo.style.width = "40px"; // Adjust width to fit the button
          button.appendChild(logo);


          button.addEventListener("click", () => {
            chrome.runtime.sendMessage(
              { type: "OPEN_SIDE_PANEL" },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.error(
                    "Error sending message:",
                    chrome.runtime.lastError.message
                  );
                } else {
                  console.log("Response from background:", response);
                }
              }
            );
          });

          document.body.appendChild(button);
        }
      } else {
        if (button) {
          document.body.removeChild(button);
          button = null;
        }
      }
    };

    const handleURLChange = () => {
      console.log("URL changed:", window.location.href);
      initializeButton();
    };

    initializeButton();

    let previousURL = window.location.href;
    const intervalId = setInterval(() => {
      const currentURL = window.location.href;
      if (currentURL !== previousURL) {
        previousURL = currentURL;
        handleURLChange();
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
      if (button) {
        document.body.removeChild(button);
      }
    };
  }, []);

  return null;
}