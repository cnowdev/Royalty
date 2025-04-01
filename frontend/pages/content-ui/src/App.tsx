import { useEffect } from 'react';

const productURLs = [
  "amazon.com/*/dp",
  "target.com/p",
  "bestbuy.com/site/*\\.p",
  "macys.com/shop/product",
  "gap.com/browse/product\\.do",
  "gamestop.com/*/products",
  "sephora.com/product",
  "jcpenney.com/p",
  "wayfair.com/*/pdp",
];

function matchesProductURL(url: string): boolean {
  return productURLs.some((pattern) => {
    const regex = new RegExp(
      pattern.replace(/\*/g, ".*").replace(/\//g, "\\/"),
      "i"
    );
    console.log("Regex pattern:", regex);
    return regex.test(url);
  });
}

export default function App() {
  useEffect(() => {
    console.log("content ui loaded");

    let button: HTMLButtonElement | null = null;

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
          button.style.backgroundColor = "#007bff";
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
          const logo = document.createElement("span");
          logo.textContent = "R"; // Replace with your logo or icon
          logo.style.fontSize = "35px";
          logo.style.textAlign = "center";
          button.appendChild(logo);

          // Add logo text below the logo
          const logoText = document.createElement("span");
          logoText.textContent = "History";
          logoText.style.fontSize = "14px";
          logoText.style.color = "#fff";
          logoText.style.textAlign = "center";
          button.appendChild(logoText);

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

    // Initialize button on first load
    initializeButton();

    // Check for URL changes every 500ms
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
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleURLChange();
    };

    return () => {
      window.removeEventListener("popstate", handleURLChange);
      if (button) {
        document.body.removeChild(button);
      }
    };
  }, []);

  return null;
}