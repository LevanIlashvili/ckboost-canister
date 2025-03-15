import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CheckCircle, ArrowRight } from "lucide-react";

export function BoostForm() {
  const [step, setStep] = useState<'amount' | 'address' | 'confirmation' | 'success'>('amount');
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  
  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('address');
  };
  
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirmation');
  };
  
  const handleConfirmation = () => {
    // In a real app, this would handle the actual boost process
    setStep('success');
  };
  
  return (
    <div className="w-full">
      {step === 'amount' && (
        <motion.form
          onSubmit={handleAmountSubmit}
          className="space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <Label htmlFor="amount">Amount of Bitcoin to Convert</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.0001"
                min="0.0001"
                placeholder="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-400">BTC</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Minimum: 0.0001 BTC</p>
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90"
            >
              <span className="flex items-center">
                <span>Continue</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </div>
        </motion.form>
      )}
      
      {step === 'address' && (
        <motion.form
          onSubmit={handleAddressSubmit}
          className="space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <Label htmlFor="address">Your ckBTC Destination Address</Label>
            <Input
              id="address"
              placeholder="Enter your ckBTC address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">This is where your ckBTC will be sent after conversion</p>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
              onClick={() => setStep('amount')}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90"
            >
              <span className="flex items-center">
                <span>Continue</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </div>
        </motion.form>
      )}
      
      {step === 'confirmation' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Confirm Your Boost</h3>
            
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Amount:</span>
                <span className="font-medium text-white">{amount} BTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Destination:</span>
                <span className="font-medium text-white truncate max-w-[200px]">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Estimated Time:</span>
                <span className="font-medium text-green-400">~5 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Fee:</span>
                <span className="font-medium text-white">0.5%</span>
              </div>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                After confirming, you'll receive a Bitcoin address to send your funds to. Once received, your ckBTC will be sent to your provided address.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
              onClick={() => setStep('address')}
            >
              Back
            </Button>
            <Button 
              type="button" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90"
              onClick={handleConfirmation}
            >
              Confirm Boost
            </Button>
          </div>
        </motion.div>
      )}
      
      {step === 'success' && (
        <motion.div
          className="text-center py-4 space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-2">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-xl font-medium text-white">Boost Initiated!</h3>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-300 mb-4">Send exactly <span className="font-bold text-white">{amount} BTC</span> to:</p>
            <div className="bg-gray-900 rounded p-3 mb-4">
              <p className="font-mono text-sm text-gray-300 break-all">bc1q8c6fshw2dlwun7ekn9qwf37cu2rn755upcp6el</p>
            </div>
            <p className="text-xs text-gray-400">
              Once your Bitcoin transaction is confirmed, your ckBTC will be sent to your provided address automatically.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Estimated delivery time: <span className="text-green-400 font-medium">5-10 minutes</span></p>
            <p className="text-xs text-gray-500">You can check the status in your dashboard</p>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
            onClick={() => {
              setAmount("");
              setAddress("");
              setStep('amount');
            }}
          >
            Start Another Boost
          </Button>
        </motion.div>
      )}
    </div>
  );
} 