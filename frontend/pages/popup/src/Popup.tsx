import React, { useState, useEffect } from 'react';
import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { Coupon, CouponCardProps } from '../../../types';
import { CouponCard } from './components/CouponCard';
import { ToggleButton } from './components/ToggleButton';
import { getCurrentTab, getDomain} from './utils';





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
      try {;

        console.log("Fetching coupons...");
        const currentURL = await getCurrentTab().then(url => getDomain(url));
        console.log(currentURL);

        const params = new URLSearchParams({
          query: currentURL,
          sort_by: "newest",
          limit: "10"
        });

        const url = `${process.env.CEB_API_URL}/coupons/search?${params.toString()}`

        interface ApiResponse {
          data: Coupon[];
        }

        const data: ApiResponse = await fetch(url, {
          method: 'GET',
        }).then(res => res.json());
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