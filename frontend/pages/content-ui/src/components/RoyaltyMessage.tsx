
const styles: { [key: string]: React.CSSProperties } = {
  royaltyContainer: {
    background: '#030712',
    color: '#f9fafb',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    width: 340,
    position: 'relative',
    fontSize: 14,
    lineHeight: '150%',
  },
  royaltyHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  royaltySubtext: {
    fontSize: 13,
    color: '#f9fafb',
    marginBottom: 12,
  },
  royaltyDescription: {
    color: '#217ED1',
    fontWeight: 'bold',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  royaltyIcon: {
    width: 50,
    height: 50,
    background: '#030712',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    marginRight: 10,
  },
  royaltyTop: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 12,
  },
  royaltyButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  royaltyApply: {
    flex: 1,
    background: '#217ED1',
    color: 'white',
    border: 'none',
    padding: 10,
    fontWeight: 'bold',
    borderRadius: 6,
    cursor: 'pointer',
  },
  royaltyLater: {
    flex: 1,
    background: '#d1d5db',
    color: '#030712',
    border: 'none',
    padding: 10,
    fontWeight: 'bold',
    borderRadius: 6,
    cursor: 'pointer',
  },
  royaltyClose: {
    position: 'absolute',
    top: 8,
    right: 10,
    background: 'none',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    color: '#d1d5db',
    fontWeight: 'bold',
  },
  royaltyMessageWrapper: {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 9999,
  },
};

export default function RoyaltyMessage({ onClose, onApply }: { onClose: () => void; onApply: () => void }) {
  return (
    <div style={styles.royaltyMessageWrapper}>
      <div style={styles.royaltyContainer}>
        <button style={styles.royaltyClose} onClick={onClose}>
          ×
        </button>
        <div style={styles.royaltyTop}>
          <div>
            <img
              src={chrome.runtime.getURL('content-ui/Royalty-Icon.svg')}
              style={styles.royaltyIcon}
              alt="Royalty Icon"
            />
          </div>
          <div>
            <div style={styles.royaltyHeader}>Royalty Found Coupons!</div>
          </div>
        </div>
        <div style={styles.royaltySubtext}>
          We found working coupon codes for this site. Would you like to apply them automatically?
        </div>
        <div style={styles.royaltyButtons}>
          <button style={styles.royaltyApply} onClick={onApply}>
            Apply Coupons
          </button>
          <button style={styles.royaltyLater} onClick={onClose}>
            Try Later
          </button>
        </div>
      </div>
    </div>
  );
}