import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { 
  ArrowUpRight, 
  AlertTriangle, 
  Check,
  Bitcoin,
  Wallet
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SendPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<"ICP" | "ckBTC">("ICP");
  const [amount, setAmount] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Mock wallet data for UI display
  const mockWalletData = {
    ICP: {
      balance: "0.5000",
      address: "abcde-12345...",
      fullAddress: "abcde-12345-abcde-12345-abcde",
      usdValue: 6.12
    },
    ckBTC: {
      balance: "0.0001",
      address: "abcde-12345...",
      fullAddress: "abcde-12345-abcde-12345-abcde",
      usdValue: 4.42
    }
  };
  
  const handleTokenChange = (newToken: "ICP" | "ckBTC") => {
    setToken(newToken);
    setError(null);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    const balance = token === "ICP" ? mockWalletData.ICP.balance : mockWalletData.ckBTC.balance;
    
    // Validate amount
    if (value && parseFloat(value) <= 0) {
      setError("Amount must be greater than 0");
    } else if (value && parseFloat(value) > parseFloat(balance)) {
      setError(`Insufficient ${token} balance`);
    } else {
      setError(null);
    }
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setError(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Send form submitted");
    
    // Validate form
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    if (!address) {
      setError("Please enter a recipient address");
      return;
    }
    
    const balance = token === "ICP" ? mockWalletData.ICP.balance : mockWalletData.ckBTC.balance;
    if (parseFloat(amount) > parseFloat(balance)) {
      setError(`Insufficient ${token} balance`);
      return;
    }
    
    // Mock sending tokens
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log(`Sending ${amount} ${token} to ${address}`);
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-950 via-blue-950/20 to-gray-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-10 md:py-16 relative">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-center">
              Send {token}
            </h1>
            <p className="text-gray-400 text-center mt-2">
              Send {token} to another wallet address
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="relative backdrop-blur-md overflow-hidden shadow-xl border-gray-800/50">
              {/* Glassmorphism card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 -z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 -z-10"></div>
              
              <CardHeader>
                <div className="flex justify-center space-x-4">
                  <Button
                    variant={token === "ICP" ? "primary" : "outline"}
                    className={token === "ICP" ? "bg-gradient-to-r from-purple-600 to-indigo-600" : "border-gray-700 text-gray-300"}
                    onClick={() => handleTokenChange("ICP")}
                    disabled={isLoading || isSuccess}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                        <img 
                          src="https://cryptologos.cc/logos/internet-computer-icp-logo.png" 
                          alt="ICP Logo" 
                          className="h-3 w-3"
                        />
                      </div>
                      <span>ICP</span>
                    </div>
                  </Button>
                  <Button
                    variant={token === "ckBTC" ? "primary" : "outline"}
                    className={token === "ckBTC" ? "bg-gradient-to-r from-orange-600 to-amber-600" : "border-gray-700 text-gray-300"}
                    onClick={() => handleTokenChange("ckBTC")}
                    disabled={isLoading || isSuccess}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <Bitcoin className="h-3 w-3 text-orange-400" />
                      </div>
                      <span>ckBTC</span>
                    </div>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {isSuccess ? (
                  <div className="p-6 flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                      <Check className="h-8 w-8 text-green-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Transaction Sent!</h4>
                    <p className="text-gray-400 text-center mb-6">
                      Your {token} transaction has been submitted successfully.
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => navigate("/wallet")}
                    >
                      Back to Wallet
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="amount" className="block text-sm font-medium text-blue-300">
                        Amount
                      </label>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          placeholder={`0.0001`}
                          value={amount}
                          onChange={handleAmountChange}
                          className="pl-4 pr-16 border-gray-700/50 bg-gray-800/50 focus:border-blue-500 focus:ring-blue-500/50 h-12 rounded-lg"
                          required
                          disabled={isLoading || isSuccess}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <span className="text-gray-400 font-medium">{token}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          Available: {token === "ICP" ? mockWalletData.ICP.balance : mockWalletData.ckBTC.balance} {token}
                        </span>
                        <button 
                          type="button" 
                          className="text-blue-400 hover:text-blue-300"
                          onClick={() => {
                            setAmount(token === "ICP" ? mockWalletData.ICP.balance : mockWalletData.ckBTC.balance);
                          }}
                          disabled={isLoading || isSuccess}
                        >
                          Max
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="address" className="block text-sm font-medium text-blue-300">
                        Recipient Address
                      </label>
                      <Input
                        id="address"
                        type="text"
                        placeholder={`Enter ${token} address`}
                        value={address}
                        onChange={handleAddressChange}
                        className="border-gray-700/50 bg-gray-800/50 focus:border-blue-500 focus:ring-blue-500/50 h-12 rounded-lg"
                        required
                        disabled={isLoading || isSuccess}
                      />
                    </div>
                    
                    {error && (
                      <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 flex gap-2 items-start">
                        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">
                          {error}
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/20 py-5 text-base rounded-xl"
                      disabled={isLoading || !!error || isSuccess}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ArrowUpRight className="h-5 w-5" />
                          Send {token}
                        </span>
                      )}
                    </Button>
                    
                    <p className="text-xs text-gray-400 text-center">
                      Please double-check the recipient address before sending. Transactions cannot be reversed.
                    </p>
                  </form>
                )}
              </CardContent>
              
              <CardFooter>
                <div className="w-full">
                  <Button 
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    onClick={() => navigate("/wallet")}
                    disabled={isLoading}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Back to Wallet
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 