import React, { useEffect, useState } from 'react';
import { matchesProductURL, autoApplyProductURLs } from '@extension/shared';
import RoyaltyMessage from './components/RoyaltyMessage';
import RoyaltyButton from './components/RoyaltyButton';

export default function App() {
  const [showMessage, setShowMessage] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    let prevURL = window.location.href;
    const checkURL = () => {
      const currentURL = window.location.href;
      if (currentURL !== prevURL) {
        prevURL = currentURL;
        updateUI();
      }
    };
    const interval = setInterval(checkURL, 500);
    updateUI();
    return () => clearInterval(interval);

    function updateUI() {
      const url = window.location.href;
      setShowMessage(autoApplyProductURLs.some((u) => url.includes(u)));
      setShowButton(!!url && matchesProductURL(url));
    }
    // eslint-disable-next-line
  }, []);

  const handleApply = () => {
    chrome.runtime.sendMessage({ type: 'AUTO_APPLY_BUTTON_CLICKED' }, () => {
      setShowMessage(false);
    });
  };

  return (
    <>
      {showMessage && (
        <RoyaltyMessage onClose={() => setShowMessage(false)} onApply={handleApply} />
      )}
      {showButton && <RoyaltyButton />}
    </>
  );
}

