import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { backend } from '../../src/backend/declarations';

function App() {
  const [name, setName] = useState<string>('');
  
  // Hook for greeting
  const greetQuery = useQuery({
    queryKey: ['greet', name],
    queryFn: async () => {
      if (!name) return 'Enter your name';
      return await backend.greet(name);
    },
    enabled: !!name,
  });

  // Hook for BTC address
  const btcAddressQuery = useQuery({
    queryKey: ['btcAddress'],
    queryFn: async () => {
      return await backend.getBTCAddress();
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">CKBoost</h1>
        
        {/* Greeting Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Greeting</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => greetQuery.refetch()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Greet
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            {greetQuery.isLoading ? (
              <p>Loading...</p>
            ) : greetQuery.isError ? (
              <p className="text-red-500">Error: {(greetQuery.error as Error).message}</p>
            ) : (
              <p>{greetQuery.data}</p>
            )}
          </div>
        </div>
        
        {/* BTC Address Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">BTC Address</h2>
          <button
            onClick={() => btcAddressQuery.refetch()}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            Get BTC Address
          </button>
          <div className="p-4 bg-gray-50 rounded-md break-all">
            {btcAddressQuery.isLoading ? (
              <p>Loading...</p>
            ) : btcAddressQuery.isError ? (
              <p className="text-red-500">Error: {(btcAddressQuery.error as Error).message}</p>
            ) : (
              <p>{btcAddressQuery.data}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
