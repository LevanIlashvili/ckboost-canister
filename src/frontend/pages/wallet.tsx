import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/card";
import { 
  Wallet, 
  Copy, 
  ArrowUpRight, 
  ArrowDownLeft, 
  X, 
  Check,
  RefreshCw
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

export function WalletPage() {
  const navigate = useNavigate();
  const [showReceiveModal, setShowReceiveModal] = useState<boolean>(false);
  const [activeToken, setActiveToken] = useState<"ICP" | "ckBTC">("ICP");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleReceive = (token: "ICP" | "ckBTC") => {
    setActiveToken(token);
    setShowReceiveModal(true);
  };
  
  const handleSend = (token: "ICP" | "ckBTC") => {
    navigate("/send");
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
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              My Wallet
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ICP Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="relative backdrop-blur-md overflow-hidden shadow-xl border-gray-800/50 h-full">
                {/* Glassmorphism card background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 -z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 -z-10"></div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center border border-purple-500/30">
                        <img 
                          src="https://cryptologos.cc/logos/internet-computer-icp-logo.png" 
                          alt="ICP Logo" 
                          className="h-6 w-6"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Internet Computer</h3>
                        <p className="text-sm text-gray-400">ICP</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Current Value</p>
                      <p className="text-sm font-medium text-gray-300">${mockWalletData.ICP.usdValue.toFixed(2)} USD</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-6">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Balance</p>
                      <p className="text-3xl font-bold text-white">{mockWalletData.ICP.balance} <span className="text-gray-400 text-lg">ICP</span></p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-400 truncate flex-1">{mockWalletData.ICP.address}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
                        onClick={() => handleCopyAddress(mockWalletData.ICP.fullAddress)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t border-gray-800/50 pt-4">
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
                      onClick={() => handleReceive("ICP")}
                    >
                      <ArrowDownLeft className="h-4 w-4 mr-2" />
                      Receive
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => handleSend("ICP")}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>

            {/* ckBTC Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="relative backdrop-blur-md overflow-hidden shadow-xl border-gray-800/50 h-full">
                {/* Glassmorphism card background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 -z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 -z-10"></div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center border border-orange-500/30">
                        <img 
                          src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" 
                          alt="ckBTC Logo" 
                          className="h-6 w-6"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Chain-Key Bitcoin</h3>
                        <p className="text-sm text-gray-400">ckBTC</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Current Value</p>
                      <p className="text-sm font-medium text-gray-300">${mockWalletData.ckBTC.usdValue.toFixed(2)} USD</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-6">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Balance</p>
                      <p className="text-3xl font-bold text-white">{mockWalletData.ckBTC.balance} <span className="text-gray-400 text-lg">ckBTC</span></p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-400 truncate flex-1">{mockWalletData.ckBTC.address}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
                        onClick={() => handleCopyAddress(mockWalletData.ckBTC.fullAddress)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t border-gray-800/50 pt-4">
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white"
                      onClick={() => handleReceive("ckBTC")}
                    >
                      <ArrowDownLeft className="h-4 w-4 mr-2" />
                      Receive
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => handleSend("ckBTC")}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Receive Modal */}
      <AnimatePresence>
        {showReceiveModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-full ${activeToken === "ICP" ? "bg-purple-500/20" : "bg-orange-500/20"} flex items-center justify-center`}>
                    {activeToken === "ICP" ? (
                      <img src="https://cryptologos.cc/logos/internet-computer-icp-logo.png" alt="ICP Logo" className="h-4 w-4" />
                    ) : (
                      <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" alt="ckBTC Logo" className="h-4 w-4" />
                    )}
                  </div>
                  Receive {activeToken}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={() => setShowReceiveModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-6 flex flex-col items-center">
                <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-6 aspect-square rounded-lg shadow-lg flex-shrink-0 relative group overflow-hidden flex items-center justify-center border border-blue-500/20 mb-6">
                  <QRCodeSVG 
                    value={mockWalletData[activeToken].fullAddress}
                    size={200}
                    bgColor={"rgba(0,0,0,0)"}
                    fgColor={"rgba(96, 165, 250, 0.9)"}
                    level={"M"}
                    includeMargin={true}
                  />
                </div>
                
                <div className="w-full space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Your {activeToken} Address</p>
                    <div className="bg-gray-900/70 rounded-lg p-3 font-mono text-sm text-gray-300 break-all border border-gray-800/80 shadow-inner">
                      {mockWalletData[activeToken].fullAddress}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant={copySuccess ? "primary" : "primary"}
                    onClick={() => handleCopyAddress(mockWalletData[activeToken].fullAddress)}
                  >
                    {copySuccess ? (
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Copied!
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Copy className="h-4 w-4" />
                        Copy Address
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-900/50 p-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 text-center">
                  Send only {activeToken} to this address. Sending any other assets may result in permanent loss.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 