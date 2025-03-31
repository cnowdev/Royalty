import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    console.log('content ui loaded');

    // Create the button
    // Create the button
    const button = document.createElement('button');
    button.textContent = ''; // Clear text content for logo
    button.style.position = 'fixed';
    button.style.top = '50%';
    button.style.right = '1px';
    button.style.transform = 'translateY(-50%)';
    button.style.width = '65px';
    button.style.height = '65px'; // Adjust height to fit both logo and text
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = '5px solid #007bff';
    button.style.borderRadius = '10px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '1000';
    button.style.display = 'flex';
    button.style.flexDirection = 'column'; // Stack children vertically
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    // Add a logo (example: emoji or icon)
    const logo = document.createElement('span');
    logo.textContent = 'R'; // Replace with your logo or icon
    logo.style.fontSize = '35px';
    logo.style.textAlign = 'center';
    button.appendChild(logo);

    // Add logo text below the logo
    const logoText = document.createElement('span');
    logoText.textContent = 'History';
    logoText.style.fontSize = '14px';
    logoText.style.color = '#fff';
    logoText.style.textAlign = 'center';
    button.appendChild(logoText);

    button.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError.message);
        } else {
          console.log('Response from background:', response);
        }
      });
    });

    document.body.appendChild(button);

    return () => {
      document.body.removeChild(button);
    };
  }, []);

  return null;
}