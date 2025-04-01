import React, { useState, useEffect } from 'react';
import '@src/SidePanel.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { Line } from 'react-chartjs-2';
import { APIClient } from '@extension/shared';
import { RetailerProduct } from '@extension/shared';
import { getCurrentTab, getDomain } from '../../popup/src/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const SidePanel = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const toggleTheme = () => {
    exampleThemeStorage.set(isLight ? 'dark' : 'light');
  };

  const [retailers, setRetailers] = useState<RetailerProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<RetailerProduct | null>(null);
  const [priceHistory, setPriceHistory] = useState<{ date: string; price: number }[]>([]);
  const [showChart, setShowChart] = useState<boolean>(true);

  useEffect(() => {
    const fetchRetailers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Replace with the actual product URL or object ID
        const productURL = await getCurrentTab(); // Use the current URL
        console.log('Product URL:', productURL);
        const retailerProduct = await APIClient.getRetailerProduct(productURL);
        console.log('Retailer Product:', retailerProduct.product);
        // Fetch related products using the object ID
        const relatedProducts = await APIClient.getRelatedProducts(retailerProduct.product.objectId);
        console.log('Related Products:', relatedProducts);
        // Set the current product and related retailers
        setCurrentProduct(retailerProduct);
        setRetailers(relatedProducts);

        // Generate price history data for the chart
        const pricingData: { createdAt: string; price: string }[] = (await APIClient.getRetailerProductPricingData(retailerProduct.retailerProductId, retailerProduct.retailerName)).map((entry) => ({
          ...entry,
          price: entry.price.toString(),
        }));
        const priceHistoryData = pricingData.map((entry) => ({
          date: new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: parseFloat(entry.price),
        }));

        if (priceHistoryData.length > 0) {
          const lastPrice = priceHistoryData[priceHistoryData.length - 1].price;
          const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          priceHistoryData.push({ date: today, price: lastPrice });
        }

        console.log("Retailer name: ", retailerProduct.retailerName);
        console.log('Price History Data:', priceHistoryData);
        setPriceHistory(priceHistoryData);
      } catch (err: any) {
        console.error('Error fetching retailers:', err);
        setError("An error occurred while fetching data. Make sure you're on a product page. We also may not support this retailer yet.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRetailers();

    const handleTabUpdate = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (changeInfo.url) {
        console.log('URL changed:', changeInfo.url);
        window.close(); // Close the side panel when the URL changes
      }
    };

    chrome.tabs.onUpdated.addListener(handleTabUpdate);
  }, []);

  const visitRetailerSite = (url: string) => {
    if (url) {
      let fullUrl = url;
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `https://${fullUrl}`;
      }
      chrome.tabs.create({ url: fullUrl });
    }
  };


  const data = {
    labels: priceHistory.map((entry) => entry.date),
    datasets: [
      {
        label: 'Price ($)',
        data: priceHistory.map((entry) => entry.price),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className={`App w-full h-full font-sans ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <header className={`p-4 pb-3 border-b ${isLight ? 'border-gray-200' : 'border-gray-600'} flex justify-between items-center gap-2`}>
        <h1 className={`text-lg font-bold truncate ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
          Price History
        </h1>
      </header>

      <main className="p-4 overflow-y-auto h-[calc(100%-60px)] custom-scrollbar">
        {isLoading && (
          <div className={`text-center py-10 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Loading price data...
          </div>
        )}

        {error && !isLoading && (
          <div className={`text-center py-6 px-2 rounded border ${isLight ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-900/50 border-red-700/50 text-red-300'}`}>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && currentProduct && (
          <div className="space-y-6">
            {/* Product Title and Image */}
            <div className="flex items-center gap-3">
              <img 
                src={currentProduct.imageUrl || 'https://via.placeholder.com/150'} 
                alt={currentProduct.name || 'Product Image'} 
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h2 className={`text-sm font-medium leading-tight ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
                  {currentProduct.name}
                </h2>
              </div>
            </div>

            {/* Price Chart */}
            <div className={`p-3 rounded-lg border ${isLight ? 'border-gray-500 bg-white' : 'border-gray-700 bg-gray-900'}`}>
              <h3 className={`text-sm font-medium mb-2 ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                Price History
              </h3>
              {currentProduct?.retailerName === "amazon" ? (
                <>

                  <div className="h-64 md:h-96 lg:h-[450px] relative">
                    <button
                      onClick={() => setShowChart((prev) => !prev)}
                      className={`absolute top-[-10px] left-2 text-xs underline ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
                    >
                      {showChart ? 'Show CCC' : 'Show Chart'}
                    </button>
                    {showChart ? (
                      <Line data={data} options={options} />
                    ) : (
                      <img
                        src={`https://charts.camelcamelcamel.com/us/${currentProduct.retailerProductId}/amazon.png?force=1&zero=0&w=100&h=100&desired=false&legend=1&ilt=1&tp=3m&fo=0&lang=en`} // Replace with the actual image URL
                        alt="We may not support this product yet"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="h-48 md:h-64 lg:h-80">
                  <Line data={data} options={options} />
                </div>
              )}

            </div>
            <div className={`grid grid-cols-3 gap-3 text-center`}>
              <div className={`p-3 rounded-lg border ${isLight ? 'border-gray-500 bg-white' : 'border-gray-700 bg-gray-900'}`}>
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Current Price</p>
                <p className={`text-lg font-bold ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>
                ${Number(currentProduct.price).toFixed(2)}
                </p>
              </div>
              <div className={`p-3 rounded-lg border ${isLight ? 'border-gray-500 bg-white' : 'border-gray-700 bg-gray-900'}`}>
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Lowest Price</p>
              <p className={`text-lg font-bold ${isLight ? 'text-gray-800' : 'text-green-500'}`}>
                ${Math.min(...priceHistory.map((entry) => entry.price)).toFixed(2)}
              </p>
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                {priceHistory.find((entry) => entry.price === Math.min(...priceHistory.map((e) => e.price)))?.date || ''}
              </p>
              </div>
              <div className={`p-3 rounded-lg border ${isLight ? 'border-gray-500 bg-white' : 'border-gray-700 bg-gray-900'}`}>
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Highest Price</p>
              <p className={`text-lg font-bold ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>
                ${Math.max(...priceHistory.map((entry) => entry.price)).toFixed(2)}
              </p>
              </div>
            </div>

            {/* Retailers List */}
            <div>
              <h3 className={`text-sm font-medium mb-3 ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                All Retailers
              </h3>
              <div className="space-y-3">
                {retailers.map((retailer) => (
                  <div
                    key={retailer.id}
                    className={`p-3 rounded-lg border flex items-center ${isLight ? 'border-gray-500 bg-white' : 'border-gray-700 bg-gray-900'}`}
                  >
                    <div className="w-10 h-10 flex-shrink-0 mr-3 bg-white rounded overflow-hidden border">
                      <img 
                        src={currentProduct.imageUrl} 
                        alt={retailer.retailerName} 
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                        {retailer.retailerName.charAt(0).toUpperCase() + retailer.retailerName.slice(1)}
                      </h4>
                      <div className="flex items-center text-xs mt-1 space-x-2">
                        <span className={`font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          ${retailer.price}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => visitRetailerSite(retailer.retailerProductUrl)}
                      className={`ml-3 px-3 py-1 text-xs rounded transition-colors duration-150 
                      ${isLight
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                    >
                      Visit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(
    SidePanel,
    <div className="w-full h-full flex items-center justify-center text-gray-500">Loading Price History...</div>
  ),
  <div className="w-full p-4 text-red-600">An unexpected error occurred.</div>
);