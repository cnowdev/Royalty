const styles: { [key: string]: React.CSSProperties } = {
  royaltyButton: {
    position: 'fixed',
    top: '50%',
    right: '1px',
    transform: 'translateY(-50%)',
    width: '65px',
    height: '65px',
    backgroundColor: '#030712',
    color: '#fff',
    border: '5px solid #217ED1',
    borderRadius: '10px',
    cursor: 'pointer',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  royaltyButtonImg: {
    height: '40px',
    width: '40px',
  },
};

export default function RoyaltyButton() {
  return (
    <button
      style={styles.royaltyButton}
      onClick={() => {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError.message);
          } else {
            console.log('Response from background:', response);
          }
        });
      }}
    >
      <img
        src={chrome.runtime.getURL('content-ui/Royalty-Icon.svg')}
        style={styles.royaltyButtonImg}
        alt="Royalty Logo"
      />
    </button>
  );
}
