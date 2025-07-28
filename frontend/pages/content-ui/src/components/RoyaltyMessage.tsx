export default function RoyaltyMessage({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: () => void;
}) {
  return (
    <div className="fixed top-5 right-5 z-[9999]">
      <div className="relative w-[340px] bg-background text-foreground p-5 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] text-[14px] leading-[150%]">
        <button
          className="absolute top-2 right-2 bg-none border-none text-muted font-bold text-[16px] cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex items-center mb-3">
          <div>
            <img
              src={chrome.runtime.getURL("content-ui/Royalty-Icon.svg")}
              className="w-[50px] h-[50px] bg-background rounded-full flex items-center justify-center text-[24px] mr-2.5"
              alt="Royalty Icon"
            />
          </div>
          <div>
            <div className="text-[18px] font-bold text-foreground">
              Royalty Found Coupons!
            </div>
          </div>
        </div>
        <div className="text-[13px] text-foreground mb-3">
          We found working coupon codes for this site. Would you like to apply them automatically?
        </div>
        <div className="flex justify-between gap-2.5 mt-2.5">
          <button
            className="flex-1 bg-primary text-foreground border-none py-2 font-bold rounded-md cursor-pointer"
            onClick={onApply}
          >
            Apply Coupons
          </button>
          <button
            className="flex-1 bg-muted text-background border-none py-2 font-bold rounded-md cursor-pointer"
            onClick={onClose}
          >
            Try Later
          </button>
        </div>
      </div>
    </div>
  );
}
