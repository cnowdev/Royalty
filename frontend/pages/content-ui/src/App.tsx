import { useEffect } from 'react';
import { matchesProductURL, autoApplyProductURLs } from '@extension/shared';
import { error } from 'console';
import { text } from 'stream/consumers';

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
        const shadowHost = document.createElement("div");
        shadowHost.style.position = "fixed";
        shadowHost.style.top = "20px";
        shadowHost.style.right = "20px";
        shadowHost.style.zIndex = "9999";
        document.body.appendChild(shadowHost);

        const shadow = shadowHost.attachShadow({ mode: "open" });

        const style = document.createElement("style");
        style.textContent = `
        .royalty-container {
          background: #030712;
          color: #f9fafb;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          width: 340px;
          position: relative;
          font-size: 14px;
          line-height: 150%;
          text-spacing: 120%;
        }
        .royalty-header {
          font-size: 18px;
          font-weight: bold;
          color: #f9fafb;
        }
        .royalty-subtext {
          font-size: 13px;
          color: #f9fafb;
          margin-bottom: 12px;
        }
        .royalty-description {
          color: #217ED1;
          font-weight: bold;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .royalty-icon {
          width: 50px;
          height: 50px;
          background: #030712;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-right: 10px;
        }
        .royalty-top {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        .royalty-buttons {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
        }
        .royalty-apply {
          flex: 1;
          background: #217ED1;
          color: white;
          border: none;
          padding: 10px;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
        }
        .royalty-later {
          flex: 1;
          background: #d1d5db;
          color: #030712;
          border: none;
          padding: 10px;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
        }
        .royalty-success {
          margin-top: 14px;
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #051040;
        }
        .royalty-success::before {
          content: "⬆️";
          margin-right: 6px;
        }
        .royalty-close {
          position: absolute;
          top: 8px;
          right: 10px;
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #d1d5db;
          font-weight: bold;
        }
    `;
        shadow.appendChild(style);

        messageDiv = document.createElement("div");
        messageDiv.className = "royalty-container";

        const closeButton = document.createElement("button");
        closeButton.className = "royalty-close";
        closeButton.textContent = "×";
        closeButton.addEventListener("click", () => {
          if (shadowHost) document.body.removeChild(shadowHost);
        });

        const iconRow = document.createElement("div");
        iconRow.className = "royalty-top";

        const icon = document.createElement("div");

        let iconImage = document.createElement("img");
        iconImage.src = chrome.runtime.getURL("content-ui/Royalty-Icon.svg");
        iconImage.className = "royalty-icon";
        icon.appendChild(iconImage);

        const header = document.createElement("div");

        const textElement = document.createElement("div");
        textElement.className = "royalty-header";
        textElement.textContent = "Royalty Found Coupons!";

        header.appendChild(textElement);

        iconRow.appendChild(icon);
        iconRow.appendChild(header);

        const subText = document.createElement("div");
        subText.className = "royalty-subtext";
        subText.innerHTML = `We found working coupon codes for this site. Would you like to apply them automatically?`;

        const buttons = document.createElement("div");
        buttons.className = "royalty-buttons";

        const applyBtn = document.createElement("button");
        applyBtn.className = "royalty-apply";
        applyBtn.textContent = "Apply Coupons";
        applyBtn.addEventListener("click", () => {
          chrome.runtime.sendMessage({ type: 'AUTO_APPLY_BUTTON_CLICKED' }, () => {
            closeButton.click();
          });
        });

        const laterBtn = document.createElement("button");
        laterBtn.className = "royalty-later";
        laterBtn.textContent = "Try Later";
        laterBtn.addEventListener("click", () => {
          closeButton.click();
        });

        buttons.appendChild(applyBtn);
        buttons.appendChild(laterBtn);


        messageDiv.appendChild(closeButton);
        messageDiv.appendChild(iconRow);
        messageDiv.appendChild(subText);
        messageDiv.appendChild(buttons);
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