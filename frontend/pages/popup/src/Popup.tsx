import React, { useState, useEffect } from 'react';
import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

interface ToggleButtonProps {
  isLight: boolean;
  toggleTheme: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isLight, toggleTheme }) => {
  const sunIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
  const moonIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-300">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isLight
          ? 'hover:bg-gray-200 focus:ring-blue-500 focus:ring-offset-slate-50'
          : 'hover:bg-gray-600 focus:ring-indigo-400 focus:ring-offset-gray-800'
      }`}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {isLight ? sunIcon : moonIcon}
    </button>
  );
};

interface Coupon {
  id: number;
  created_at: string;
  code: string;
  title: string;
  description: string;
  discount_value: number;
  discount_type: "PERCENTAGE_OFF" | "FIXED_AMOUNT_OFF" | string;
  merchant_name: string;
  merchant_url: string;
}

interface CouponCardProps {
  coupon: Coupon;
  isLight: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, isLight }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code)
      .then(() => {
        setCopied(true);
        const timer = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(timer);
      })
      .catch(err => console.error('Failed to copy code: ', err));
  };

  const formatDiscount = (value: number, type: string): string => {
    switch (type) {
      case 'PERCENTAGE_OFF': return `${value}% OFF`;
      case 'FIXED_AMOUNT_OFF': return `$${value} OFF`;
      default: return `${value} ${type.replace(/_/g, ' ').toLowerCase()}`;
    }
  };

  return (
    <div className={`border rounded-lg p-3 md:p-4 shadow-sm mb-3 transition-colors duration-200 ${ isLight ? 'bg-white border-gray-200 hover:shadow-md' : 'bg-gray-700 border-gray-600 hover:bg-gray-650'}`}>
      <div className="flex justify-between items-start gap-2 mb-2">
        <h3 className={`font-semibold text-sm md:text-base flex-1 ${ isLight ? 'text-gray-800' : 'text-white'}`}>{coupon.title}</h3>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap ${ isLight ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-green-900 text-green-300 border border-green-700'}`}>
          {formatDiscount(coupon.discount_value, coupon.discount_type)}
        </span>
      </div>
      {coupon.description && (
        <p className={`text-xs md:text-sm mb-3 ${ isLight ? 'text-gray-600' : 'text-gray-300'}`}>{coupon.description}</p>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className={`border-2 border-dashed px-3 py-1 rounded text-sm font-mono truncate cursor-text select-all ${ isLight ? 'border-gray-300 text-indigo-700 bg-gray-50' : 'border-gray-500 text-indigo-300 bg-gray-600'}`} title={coupon.code}>
          {coupon.code}
        </span>
        <button onClick={handleCopy} className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap ${ copied ? `text-white ${isLight ? 'bg-green-500 focus:ring-green-400' : 'bg-green-600 focus:ring-green-500'}` : `text-white ${isLight ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-600'}`} ${ isLight ? 'focus:ring-offset-white' : 'focus:ring-offset-gray-700'}`}>
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
    </div>
  );
};


interface ApiResponse {
  data: Coupon[];
}

const mockApiResponse: ApiResponse = {
  "data": [
        { "id": 65260, "created_at": "2025-01-03T12:47:45.889Z", "code": "ahjghjasdg", "title": "Get 20% Off Your Order", "description": "Take up to 20% off when you add this Target code.", "discount_value": 20, "discount_type": "PERCENTAGE_OFF", "merchant_name": "Target Coupons", "merchant_url": "target.com" },
        { "id": 65264, "created_at": "2025-01-03T12:47:45.889Z", "code": "TCFKGF9LCTFPJ9W3", "title": "Target Promo Code: 10% Off", "description": "Receive 10% off your purchase with this discount code at Target.", "discount_value": 10, "discount_type": "PERCENTAGE_OFF", "merchant_name": "Target Coupons", "merchant_url": "target.com" },
        { "id": 65265, "created_at": "2025-01-04T10:00:00.000Z", "code": "SAVE5BUCKS", "title": "$5 Off Orders Over $50", "description": "Get $5 discount on your next purchase when you spend $50 or more.", "discount_value": 5, "discount_type": "FIXED_AMOUNT_OFF", "merchant_name": "Target Coupons", "merchant_url": "target.com" },
    ]
};

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const toggleTheme = () => {
    exampleThemeStorage.set(isLight ? 'dark' : 'light');
  };

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState<string>('Available Coupons');
  const [merchantUrl, setMerchantUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      setError(null);
      setMerchantName('Loading...'); // Set initial loading title
      setMerchantUrl(null);
      try {
        // ======================================================
        // IMPORTANT: Replace this section with your actual API call
        // Example:
        // const currentTab = await getCurrentTab(); // Helper to get current tab URL
        // const response = await fetch(`YOUR_API_ENDPOINT?url=${currentTab.url}`);
        // if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        // const data: ApiResponse = await response.json();

        console.log("Fetching coupons (mock)...");
        await new Promise(resolve => setTimeout(resolve, 750));
        const data: ApiResponse = mockApiResponse;
        console.log("Mock data received:", data);


        if (data && data.data && data.data.length > 0) {
           setCoupons(data.data);
           const firstCoupon = data.data[0];
           setMerchantName(firstCoupon.merchant_name?.replace(' Coupons', '') + ' Coupons' || 'Available Coupons');
           setMerchantUrl(firstCoupon.merchant_url || null);
        } else {
           setCoupons([]);
           setMerchantName('No Coupons Found');
        }
      } catch (err: any) {
        console.error("Error fetching coupons:", err);
        setError(`Failed to load coupons. ${err.message || ''}`.trim());
        setMerchantName('Error Loading Coupons');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

   const goToMerchantSite = () => {
    if (merchantUrl) {
        let url = merchantUrl;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }
        chrome.tabs.create({ url: url });
    }
   };


  return (
    <div className={`App w-80 p-4 font-sans ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>

      <header className={`mb-4 pb-3 border-b ${isLight ? 'border-gray-200' : 'border-gray-600'} flex justify-between items-center gap-2`}>
         <h1
            className={`text-lg font-bold truncate ${isLight ? 'text-gray-900' : 'text-gray-100'} ${merchantUrl ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
            onClick={goToMerchantSite}
            title={merchantUrl ? `Visit ${merchantUrl}` : merchantName}
        >
            {merchantName}
         </h1>
         <ToggleButton isLight={isLight} toggleTheme={toggleTheme} />
      </header>


      <main className="max-h-96 overflow-y-auto pr-1 custom-scrollbar"> 
        {isLoading && (
          <div className={`text-center py-10 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Loading coupons...
          </div>
        )}

        {error && !isLoading && (
          <div className={`text-center py-6 px-2 rounded border ${isLight ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-900/50 border-red-700/50 text-red-300'}`}>
            <p className="font-semibold mb-1">Oops! Something went wrong.</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && coupons.length > 0 && (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} isLight={isLight} />
            ))}
          </div>
        )}

        {!isLoading && !error && coupons.length === 0 && (
           <div className={`text-center py-10 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
             No coupons found for this site right now. Check back later!
           </div>
        )}
      </main>

     
      <footer className={`mt-4 pt-3 border-t text-xs text-center ${isLight ? 'border-gray-200 text-gray-400' : 'border-gray-600 text-gray-500'}`}>
         Powered by YourCouponAPI
      </footer>
    </div>
  );
};

export default withErrorBoundary(
    withSuspense(Popup, <div className="w-80 h-40 flex items-center justify-center text-gray-500">Loading Extension...</div>),
    <div className="w-80 p-4 text-red-600">An unexpected error occurred.</div>
);