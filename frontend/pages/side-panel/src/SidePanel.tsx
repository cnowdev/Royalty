import React, { useState, useEffect } from 'react';
import '@src/SidePanel.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { Line } from 'react-chartjs-2';
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


// Mock price history data - this would come from your API
const mockPriceHistory = [
  { date: 'Jan 10', price: 15.99 },
  { date: 'Jan 25', price: 15.99 },
  { date: 'Feb 5', price: 14.99 },
  { date: 'Feb 20', price: 14.99 },
  { date: 'Mar 1', price: 12.99 },
  { date: 'Mar 15', price: 15.99 },
  { date: 'Mar 30', price: 14.99 },
];

const data = {
  labels: mockPriceHistory.map((entry) => entry.date),
  datasets: [
    {
      label: 'Price ($)',
      data: mockPriceHistory.map((entry) => entry.price),
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
  scales: {
    x: {
      type: 'time' as const,
      time: { unit: 'month' },
      title: { display: true, text: 'Date' },
    },
    y: {
      title: { display: true, text: 'Price ($)' },
      beginAtZero: false,
    },
  },
};

interface Retailer {
  productIdentifier: { sku: string };
  productName: string;
  productUrl: string;
  productDescription: string;
  seoDescription: string | null;
  brandName: string;
  skuCondition: string;
  retailer: string;
  retailer_display_name: string;
  imageUrl: string;
  gender: string | null;
  color: string;
  size: string;
  price: number;
  basePrice: number;
  salePrice: number;
  out_of_stock: boolean | null;
  custom_pdp: any | null;
  affiliateUrl: string;
  ObjectId: string;
  lowest_price: number | null;
  highest_price: number | null;
  lowest_price_date: string | null;
  highest_price_date: string | null;
  productCategory: string;
  product_id: string;
  visitedTimestamp: string;
  actionlabel: string;
}

const SidePanel = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const toggleTheme = () => {
    exampleThemeStorage.set(isLight ? 'dark' : 'light');
  };

  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Retailer | null>(null);

  // Calculate price stats from the mock history data
  const lowestPrice = Math.min(...mockPriceHistory.map(item => item.price));
  const highestPrice = Math.max(...mockPriceHistory.map(item => item.price));
  const lowestPriceEntry = mockPriceHistory.find(item => item.price === lowestPrice);
  const lowestPriceDate = lowestPriceEntry ? lowestPriceEntry.date : 'N/A';

  useEffect(() => {
    const fetchRetailers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // This would be replaced with an actual API call
        const mockData: Retailer[] = [
          {
            "productIdentifier": {"sku": "B07RBBCZZ1"},
            "productName": "Pokemon Official & Premium Quality 8-Inch Pikachu Plush - Adorable, Ultra-Soft, Plush Toy, Perfect for Playing & Displaying - Gotta Catch 'Em All , Yellow",
            "productUrl": "https://www.amazon.com/dp/B07RBBCZZ1",
            "productDescription": "Officially licensed Pokémon merchandise by the Pokémon Company. Measures: 10\" To top of ear. Ages: 2+\"",
            "seoDescription": null,
            "brandName": "Jazwares",
            "skuCondition": "new",
            "retailer": "amazon",
            "retailer_display_name": "Amazon",
            "imageUrl": "https://m.media-amazon.com/images/I/71s4RtUum3L._AC_SL1500_.jpg",
            "gender": null,
            "color": "yellow",
            "size": "8in",
            "price": 14.99,
            "basePrice": 15.99,
            "salePrice": 14.99,
            "out_of_stock": null,
            "custom_pdp": null,
            "affiliateUrl": "https://r.v2i8b.com/api/v1/bid/redirect?campaign_id=01JMFKP5KS1ZX7V005ZC1NCWRD&url=https%3A%2F%2Fwww.amazon.com%2Fdp%2FB07RBBCZZ1",
            "ObjectId": "62da2bc95b7f75ae27318240",
            "lowest_price": 12.99,
            "highest_price": 15.99,
            "lowest_price_date": "2025-03-01",
            "highest_price_date": "2025-01-10",
            "productCategory": "Toys & Games",
            "product_id": "25caac7c765bc14c78d2b195f1799c6aac0a4c13",
            "visitedTimestamp": "2025-03-29T23:59:10.654",
            "actionlabel": "Visit Site"
          },
          // Add more mock retailers here with different prices
          {
            "productIdentifier": {"sku": "PKM-PLUSH-01"},
            "productName": "Pikachu Plush 8-Inch",
            "productUrl": "https://www.target.com/pikachu-plush",
            "productDescription": "Officially licensed Pokémon plush toy",
            "seoDescription": null,
            "brandName": "Jazwares",
            "skuCondition": "new",
            "retailer": "target",
            "retailer_display_name": "Target",
            "imageUrl": "https://m.media-amazon.com/images/I/71s4RtUum3L._AC_SL1500_.jpg",
            "gender": null,
            "color": "yellow",
            "size": "8in",
            "price": 15.99,
            "basePrice": 15.99,
            "salePrice": 15.99,
            "out_of_stock": null,
            "custom_pdp": null,
            "affiliateUrl": "https://www.target.com/pikachu-plush",
            "ObjectId": "target123456",
            "lowest_price": 13.99,
            "highest_price": 16.99,
            "lowest_price_date": "2025-02-15",
            "highest_price_date": "2025-01-05",
            "productCategory": "Toys & Games",
            "product_id": "target-pikachu-01",
            "visitedTimestamp": "2025-03-29T12:00:00.000",
            "actionlabel": "Visit Site"
          },
          {
            "productIdentifier": {"sku": "PIK-8IN-PLH"},
            "productName": "Pikachu 8\" Plush Toy",
            "productUrl": "https://www.walmart.com/pikachu-plush",
            "productDescription": "Official Pokémon plush toy",
            "seoDescription": null,
            "brandName": "Jazwares",
            "skuCondition": "new",
            "retailer": "walmart",
            "retailer_display_name": "Walmart",
            "imageUrl": "https://m.media-amazon.com/images/I/71s4RtUum3L._AC_SL1500_.jpg",
            "gender": null,
            "color": "yellow",
            "size": "8in",
            "price": 13.98,
            "basePrice": 15.99,
            "salePrice": 13.98,
            "out_of_stock": null,
            "custom_pdp": null,
            "affiliateUrl": "https://www.walmart.com/pikachu-plush",
            "ObjectId": "walmart123456",
            "lowest_price": 11.99,
            "highest_price": 15.99,
            "lowest_price_date": "2025-02-20",
            "highest_price_date": "2025-01-15",
            "productCategory": "Toys & Games",
            "product_id": "walmart-pikachu-01",
            "visitedTimestamp": "2025-03-29T14:30:00.000",
            "actionlabel": "Visit Site"
          }
        ];
        
        setRetailers(mockData);
        setCurrentProduct(mockData[0]); // Set the first retailer as current product
      } catch (err: any) {
        console.error("Error fetching retailers:", err);
        setError(`${err.message || ''}`.trim());
      } finally {
        setIsLoading(false);
      }
    };

    fetchRetailers();
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

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      // Check if it's already in a formatted state like "Mar 1"
      if (dateString.includes(' ')) return dateString;
      
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
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
              <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden border bg-white">
                <img 
                  src={currentProduct.imageUrl}
                  alt={currentProduct.productName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className={`text-sm font-medium leading-tight ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
                  {currentProduct.productName.length > 70 
                    ? `${currentProduct.productName.substring(0, 70)}...` 
                    : currentProduct.productName}
                </h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {currentProduct.brandName} • {currentProduct.size} • {currentProduct.color}
                </p>
              </div>
            </div>

            {/* Price Chart */}
            <div className={`p-3 rounded-lg border ${isLight ? 'border-gray-500 bg-white' : 'border-gray-700 bg-gray-900'}`}>
              <h3 className={`text-sm font-medium mb-2 ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                Price History
              </h3>
              <div className="h-48">
                <Line data={data}/>
              </div>
            </div>

            {/* Price Stats */}
            <div className={`grid grid-cols-3 gap-3 text-center`}>
              <div className={`p-3 rounded-lg border ${isLight ? 'border-gray-500 bg-white' : 'border-gray-700 bg-gray-900'}`}>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Current Price</p>
                <p className={`text-lg font-bold ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>
                  ${currentProduct.price}
                </p>
              </div>
              <div className={`p-3 rounded-lg border ${isLight ? 'border-gray-500 bg-white' : 'border-gray-700 bg-gray-900'}`}>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Lowest Price</p>
                <p className={`text-lg font-bold ${isLight ? 'text-gray-800' : 'text-green-500'}`}>
                  ${lowestPrice}
                </p>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {lowestPriceDate}
                </p>
              </div>
              <div className={`p-3 rounded-lg border ${isLight ? 'border-gray-500 bg-white' : 'border-gray-700 bg-gray-900'}`}>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Highest Price</p>
                <p className={`text-lg font-bold ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>
                  ${highestPrice}
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
                    key={retailer.ObjectId}
                    className={`p-3 rounded-lg border flex items-center ${isLight ? 'border-gray-500 bg-white' : 'border-gray-700 bg-gray-900'}`}
                  >
                    <div className="w-10 h-10 flex-shrink-0 mr-3 bg-white rounded overflow-hidden border">
                      <img 
                        src={currentProduct.imageUrl} 
                        alt={retailer.retailer_display_name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                        {retailer.retailer_display_name}
                      </h4>
                      <div className="flex items-center text-xs mt-1 space-x-2">
                        <span className={`font-medium ${
                          retailer.price === lowestPrice 
                            ? (isLight ? 'text-green-600' : 'text-green-400') 
                            : (isLight ? 'text-gray-700' : 'text-gray-300')
                        }`}>
                          ${retailer.price}
                        </span>
                        <span className={`${isLight ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                        <span className={`${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                          Low: ${retailer.lowest_price} ({formatDate(retailer.lowest_price_date)})
                        </span>
                        <span className={`${isLight ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                        <span className={`${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                          High: ${retailer.highest_price}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => visitRetailerSite(retailer.productUrl)}
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
