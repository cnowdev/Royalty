import React from 'react';
import { RetailerProduct } from '@extension/shared';
import { getRetailerDisplayName, getRetailerLogo } from '@src/utils';

interface RetailerProductCardProps {
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

export default function RetailerProductCard({ retailerProduct, isLight }: RetailerProductCardProps) {
  const { retailerName, price, retailerProductUrl } = retailerProduct as any;
  const logoSvg = getRetailerLogo(retailerName);
  const formattedPrice = Number(price).toFixed(2);


  const displayLogo = logoSvg ? (
    <img src={chrome.runtime.getURL(logoSvg)} alt={retailerName} className={`w-10 h-10 object-contain rounded`}/>
  ) : (
    <div className={`w-10 h-10 rounded flex items-center justify-center text-sm font-semibold text-white ${getPastelBackground(retailerName.charAt(0).toUpperCase())}`}>
      {retailerName.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div
      key={retailerProduct.id}
      className={`p-4 rounded-xl border shadow-md flex items-center space-x-4 ${isLight ? 'border-gray-300 bg-white' : 'border-gray-700 bg-gray-900'}`}
    >
      {displayLogo}

      <div className="flex-1 min-w-0">
        <h4 className={`text-base font-semibold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
          {getRetailerDisplayName(retailerName)}
        </h4>
        <div className={`text-sm mt-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
          ${formattedPrice}
        </div>
      </div>

      <button
        onClick={() => visitRetailerSite(retailerProductUrl)}
        className={`ml-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 shadow ${isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
      >
        Visit
      </button>
    </div>
  );
}
