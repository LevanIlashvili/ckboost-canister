import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConnectWallet, useAgent } from "@nfid/identitykit/react"
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './declarations';

function App() {
  const [name, setName] = useState<string>('');
  const [unauthenticatedAgent, setUnauthenticatedAgent] = useState<HttpAgent | undefined>();
  const authenticatedAgent = useAgent({
    host: import.meta.env.VITE_DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943",
  });

  useEffect(() => {
    const host = import.meta.env.VITE_DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943";
    
    HttpAgent.create({ host }).then((agent) => {
      if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
        agent.fetchRootKey().catch((err) => {
          console.warn("Unable to fetch root key. Check your local replica is running");
          console.error(err);
        });
      }
      setUnauthenticatedAgent(agent);
    });
  }, []);

  const greetQuery = useQuery({
    queryKey: ['greet', name],
    queryFn: async () => {
      if (!name) return 'Enter your name';
      if (!unauthenticatedAgent) return 'Agent not initialized';

      const actor = Actor.createActor(idlFactory, {
        agent: unauthenticatedAgent,
        canisterId: import.meta.env.VITE_CANISTER_ID_BACKEND!,
      });

      return await actor.greet(name) as string;
    },
    enabled: !!name && !!unauthenticatedAgent,
  });
  

  const btcAddressQuery = useQuery({
    queryKey: ['btcAddress'],
    queryFn: async () => {
      if (!unauthenticatedAgent) return 'Agent not initialized';
      
      const actor = Actor.createActor(idlFactory, {
        agent: unauthenticatedAgent,
        canisterId: import.meta.env.VITE_CANISTER_ID_BACKEND!,
      });
      
      return await actor.getBTCAddress() as string;
    },
    enabled: !!unauthenticatedAgent,
  });

  const connectedWalletQuery = useQuery({
    queryKey: ['greetConnected'],
    queryFn: async () => {
      if (!authenticatedAgent) return 'Wallet not connected';
      
      if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
        await authenticatedAgent?.fetchRootKey();
      }
      
      const actor = Actor.createActor(idlFactory, {
        agent: authenticatedAgent,
        canisterId: import.meta.env.VITE_CANISTER_ID_BACKEND || "avqkn-guaaa-aaaaa-qaaea-cai",
      });
      
      const principal = await authenticatedAgent.getPrincipal();
      console.log(principal.toHex())
      try {
        const response = await actor.greet(principal?.toString() ?? "me");
        return response as string;
      } catch (error) {
        console.error("Error calling greet_no_consent:", error);
        return `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
    enabled: !!authenticatedAgent,
  });

  const whoAmIQuery = useQuery({
    queryKey: ['whoAmI'],
    queryFn: async () => {
      if (!authenticatedAgent) return 'Wallet not connected';
      
      if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
        await authenticatedAgent?.fetchRootKey();
      }
      
      const actor = Actor.createActor(idlFactory, {
        agent: authenticatedAgent,
        canisterId: import.meta.env.VITE_CANISTER_ID_BACKEND!
      });
      
      try {
        const response = await actor.whoami();
        return response as string;
      } catch (error) {
        console.error("Error calling greet_no_consent:", error);
        return `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
    enabled: !!authenticatedAgent,
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">CKBoost</h1>
        <ConnectWallet />
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
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Connected Wallet Greeting</h2>
          <button
            onClick={() => connectedWalletQuery.refetch()}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
          >
            Greet Connected Wallet
          </button>
          <div className="p-4 bg-gray-50 rounded-md">
            {connectedWalletQuery.isLoading ? (
              <p>Loading...</p>
            ) : connectedWalletQuery.isError ? (
              <p className="text-red-500">Error: {(connectedWalletQuery.error as Error).message}</p>
            ) : (
              <p>{connectedWalletQuery.data}</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Who Am I</h2>
          <button
            onClick={() => whoAmIQuery.refetch()}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            Who Am I
          </button>
          <div className="p-4 bg-gray-50 rounded-md">
            {whoAmIQuery.isLoading ? (
              <p>Loading...</p>
            ) : whoAmIQuery.isError ? (
              <p className="text-red-500">Error: {(whoAmIQuery.error as Error).message}</p>
            ) : (
              <p>{whoAmIQuery.data}</p>
            )}
          </div>
        </div>
        
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
