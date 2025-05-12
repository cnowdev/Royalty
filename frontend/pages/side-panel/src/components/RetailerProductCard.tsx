import React, { useState } from 'react';
import { RetailerProduct } from '@extension/shared';
import { getRetailerDisplayName } from '@src/utils';

interface RetailerProductCardProps {
  currentProduct: RetailerProduct;
  retailerProduct: RetailerProduct;
  isLight?: boolean;
}

const pastelColors = [
  'bg-pink-200', 'bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-purple-200', 'bg-red-200', 'bg-indigo-200'
];

const getPastelBackground = (char: string) => {
  const index = char.charCodeAt(0) % pastelColors.length;
  return pastelColors[index];
};

const visitRetailerSite = (url: string) => {
  if (url) {
    let fullUrl = url;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`;
    }
    chrome.tabs.create({ url: fullUrl });
  }
};

export default function RetailerProductCard({ retailerProduct, isLight, currentProduct }: RetailerProductCardProps) {
  const { retailerName, price, retailerProductUrl } = retailerProduct as any;
  const priceDifference = currentProduct.price - price;
  const logo = `http://localhost:3001/assets/logos/${retailerName}.jpeg`;
  const formattedPrice = Number(price).toFixed(2);

  const [logoError, setLogoError] = useState(false);

  const displayLogo = !logoError ? (
    <img src={logo} alt={retailerName} className="w-12 h-12 object-contain rounded" onError={() => setLogoError(true)}/>
  ) : (
    <div className={`w-12 h-12 rounded flex items-center justify-center text-base font-semibold text-white ${getPastelBackground(retailerName.charAt(0).toUpperCase())}`}>
      {retailerName.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div
      key={retailerProduct.id}
      onClick={() => visitRetailerSite(retailerProductUrl)}
      className={`p-5 rounded-xl border shadow-lg flex items-center justify-between space-x-5 cursor-pointer transition hover:shadow-xl ${isLight ? 'border-gray-300 bg-white' : 'border-gray-700 bg-gray-900'}`}
    >
      {displayLogo}

      <div className="flex-1 min-w-0">
        <div className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
          {getRetailerDisplayName(retailerName)}
        </div>
      </div>

      <div className="text-right">
        <div className={`text-2xl font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
          ${formattedPrice}
        </div>
        {priceDifference > 0 && (
          <div className={`mt-1 text-xs font-bold ${isLight ? 'bg-green-100 text-green-800' : 'bg-green-800 text-green-100'} px-2 py-0.5 rounded-full inline-block`}>
            Save ${priceDifference.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
