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
        messageDiv = document.createElement("div");
        messageDiv.textContent = "Royalty found coupons for this site, would you like to apply them?";
        messageDiv.style.position = "fixed";
        messageDiv.style.top = "10px";
        messageDiv.style.right = "10px";
        messageDiv.style.backgroundColor = "#0C2B62";
        messageDiv.style.color = "#fff";
        messageDiv.style.padding = "20px 5px 20px 20px";
        messageDiv.style.borderRadius = "5px";
        messageDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
        messageDiv.style.zIndex = "9999";
        messageDiv.style.fontSize = "14px";
        messageDiv.style.fontWeight = "bold";
        messageDiv.style.display = "flex";
        messageDiv.style.flexDirection = "column";
        messageDiv.style.alignItems = "center";
        messageDiv.style.justifyContent = "center";
        messageDiv.style.gap = "10px";
        messageDiv.style.maxWidth = "300px";
        messageDiv.style.maxHeight = "150px";

        const closeButton = document.createElement("button");
        closeButton.textContent = "X";
        closeButton.style.backgroundColor = "transparent";
        closeButton.style.color = "#fff";
        closeButton.style.border = "none";
        closeButton.style.cursor = "pointer";
        closeButton.style.fontSize = "16px";
        closeButton.style.fontWeight = "bold";
        closeButton.style.position = "absolute";
        closeButton.style.top = "5px";
        closeButton.style.right = "10px";

        const applyCouponsButton = document.createElement("button");
        applyCouponsButton.textContent = "Apply Coupons";
        applyCouponsButton.style.backgroundColor = "#217ED1";
        applyCouponsButton.style.color = "#fff";
        applyCouponsButton.style.border = "none";
        applyCouponsButton.style.cursor = "pointer";
        applyCouponsButton.style.fontSize = "14px";
        applyCouponsButton.style.fontWeight = "bold";
        applyCouponsButton.style.padding = "5px 10px";
        applyCouponsButton.style.marginLeft = "10px";
        applyCouponsButton.style.borderRadius = "5px";


        closeButton.addEventListener("click", () => {
          if (messageDiv) {
            document.body.removeChild(messageDiv);
            messageDiv = null;
          }
        });

        applyCouponsButton.addEventListener("click", async () => {
          chrome.runtime.sendMessage({ type: 'AUTO_APPLY_BUTTON_CLICKED' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError.message);
            }

            closeButton.click();

          });
        });

        messageDiv.appendChild(closeButton);
        messageDiv.appendChild(applyCouponsButton);
        document.body.appendChild(messageDiv);
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
          button.style.border = "5px solid #007bff";
          button.style.borderRadius = "10px";
          button.style.cursor = "pointer";
          button.style.zIndex = "1000";
          button.style.display = "flex";
          button.style.flexDirection = "column"; // Stack children vertically
          button.style.alignItems = "center";
          button.style.justifyContent = "center";
          button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";

          // Add a logo (example: emoji or icon)
          /*
          const logo = document.createElement("span");
          logo.textContent = "R"; // Replace with your logo or icon
          logo.style.fontSize = "35px";
          logo.style.textAlign = "center";
          button.appendChild(logo);
          */
          const logo = document.createElement("img");
          logo.src = chrome.runtime.getURL("content-ui/Royalty-Icon.svg");
          button.appendChild(logo);
          // Add logo text below the logo

          /*
          const logoText = document.createElement("span");
          logoText.textContent = "History";
          logoText.style.fontSize = "14px";
          logoText.style.color = "#fff";
          logoText.style.textAlign = "center";
          button.appendChild(logoText);
          */

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