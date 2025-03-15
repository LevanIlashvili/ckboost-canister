import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useQuery } from "@tanstack/react-query";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../declarations";
import { useAgent } from "@nfid/identitykit/react";

export function BoostForm() {
  const [btcAmount, setBtcAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [btcAddress, setBtcAddress] = useState<string>("");
  
  const authenticatedAgent = useAgent({
    host: import.meta.env.VITE_DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943",
  });
  
  const { data: fetchedBtcAddress } = useQuery({
    queryKey: ['btcAddress'],
    queryFn: async () => {
      const host = import.meta.env.VITE_DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943";
      const agent = await HttpAgent.create({ host });
      
      if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
        await agent.fetchRootKey().catch((err) => {
          console.warn("Unable to fetch root key. Check your local replica is running");
          console.error(err);
        });
      }
      
      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: import.meta.env.VITE_CANISTER_ID_BACKEND!,
      });
      
      return await actor.getBTCAddress() as string;
    },
  });
  
  // Update btcAddress when fetchedBtcAddress changes
  useEffect(() => {
    if (fetchedBtcAddress) {
      setBtcAddress(fetchedBtcAddress);
    }
  }, [fetchedBtcAddress]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticatedAgent) {
      alert("Please connect your wallet first");
      return;
    }
    
    if (!btcAmount || parseFloat(btcAmount) <= 0) {
      alert("Please enter a valid BTC amount");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`Boost request submitted for ${btcAmount} BTC`);
      setBtcAmount("");
    }, 1500);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="bordered" className="max-w-md mx-auto bg-glass hover-lift card-hover">
        <CardHeader>
          <CardTitle className="text-gradient">Request a Boost</CardTitle>
          <CardDescription className="text-gray-300">
            Convert your BTC to ckBTC faster with our boosting service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="btcAmount" className="block text-sm font-medium text-gray-300 mb-1">
                BTC Amount
              </label>
              <Input
                id="btcAmount"
                type="number"
                step="0.00000001"
                min="0.00000001"
                placeholder="0.01"
                value={btcAmount}
                onChange={(e) => setBtcAmount(e.target.value)}
                className="bg-black/50 border-gray-800 text-white placeholder:text-gray-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="btcAddress" className="block text-sm font-medium text-gray-300 mb-1">
                BTC Deposit Address
              </label>
              <div className="relative">
                <Input
                  id="btcAddress"
                  value={btcAddress}
                  readOnly
                  className="pr-20 font-mono text-sm bg-black/50 border-gray-800 text-white"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 hover:bg-gray-900"
                    onClick={() => {
                      navigator.clipboard.writeText(btcAddress);
                      alert("Address copied to clipboard");
                    }}
                  >
                    Copy
                  </Button>
                </motion.div>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Send your BTC to this address. It will be converted to ckBTC.
              </p>
            </div>
            
            <div className="pt-2">
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-blue-purple hover:opacity-90 glow" 
                  isLoading={isSubmitting}
                >
                  Submit Boost Request
                </Button>
              </motion.div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
} 