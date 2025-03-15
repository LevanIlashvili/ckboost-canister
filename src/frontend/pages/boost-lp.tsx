import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { Principal } from "@dfinity/principal";
import { Actor, HttpAgent } from "@dfinity/agent";
import { useAuth } from "../lib/auth-context";
import { useAgent } from "@nfid/identitykit/react";
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Info, 
  ArrowRight,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

// Skeleton component for loading state
const BalanceSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 w-24 bg-gray-700/50 rounded mb-1"></div>
    <div className="h-4 w-16 bg-gray-700/30 rounded"></div>
  </div>
);

// Mock data for liquidity positions (replace with actual data from backend)
interface LiquidityPosition {
  id: string;
  amount: number;
  percentage: number;
  createdAt: Date;
  earnings: number;
}

export function BoostLPPage() {
  const { user } = useAuth();
  const agent = useAgent();
  const [ckbtcBalance, setCkBTCBalance] = useState<number>(0);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [amount, setAmount] = useState<string>("");
  const [percentage, setPercentage] = useState<number>(0.5);
  const [isCreating, setIsCreating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock liquidity positions (replace with actual data)
  const [liquidityPositions, setLiquidityPositions] = useState<LiquidityPosition[]>([
    {
      id: "pos-1",
      amount: 0.001,
      percentage: 0.5,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      earnings: 0.00005
    },
    {
      id: "pos-2",
      amount: 0.0005,
      percentage: 1.2,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      earnings: 0.00002
    }
  ]);

  // Fetch ckBTC balance
  const getCkBTCBalance = async () => {
    if (!user) {
      return;
    }
    try {
      if (agent) {
        const ckBTCLedgerActor = Actor.createActor(
          ({ IDL }) => {
            const Account = IDL.Record({
              owner: IDL.Principal,
              subaccount: IDL.Opt(IDL.Vec(IDL.Nat8))
            });
            return IDL.Service({
              'icrc1_balance_of': IDL.Func([Account], [IDL.Nat], ['query'])
            });
          },
          {
            agent: new HttpAgent({
              host: "https://icp0.io",
            }),
            canisterId: Principal.fromText("mxzaz-hqaaa-aaaar-qaada-cai")
          }
        );
        const balanceResponse: BigInt = await ckBTCLedgerActor.icrc1_balance_of({
          owner: Principal.fromText(user?.principal || ""),
          subaccount: []
        }) as BigInt;
        const balanceInCkBTC = Number(balanceResponse) / 10 ** 8;
        setCkBTCBalance(balanceInCkBTC);
      }
    } catch (error) {
      console.error("Error fetching ckBTC balance:", error);
      setError("Failed to fetch ckBTC balance. Please try again.");
    }
  };

  const fetchData = async () => {
    setIsBalanceLoading(true);
    try {
      await getCkBTCBalance();
      // Here you would also fetch liquidity positions from the backend
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, agent]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    // Validate amount
    if (value && parseFloat(value) <= 0) {
      setError("Amount must be greater than 0");
    } else if (value && parseFloat(value) > ckbtcBalance) {
      setError(`Insufficient ckBTC balance`);
    } else {
      setError(null);
    }
  };

  const handlePercentageChange = (value: number[]) => {
    setPercentage(value[0]);
  };

  const handleCreatePosition = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    if (parseFloat(amount) > ckbtcBalance) {
      setError(`Insufficient ckBTC balance`);
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      // Here you would call the backend to create a new liquidity position
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add the new position to the list
      const newPosition: LiquidityPosition = {
        id: `pos-${Date.now()}`,
        amount: parseFloat(amount),
        percentage: percentage,
        createdAt: new Date(),
        earnings: 0
      };
      
      setLiquidityPositions([...liquidityPositions, newPosition]);
      setAmount("");
      setPercentage(0.5);
      
      // Refresh balance
      await getCkBTCBalance();
    } catch (error) {
      console.error("Error creating liquidity position:", error);
      setError("Failed to create liquidity position. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemovePosition = async (id: string) => {
    setIsRemoving(true);
    setError(null);
    
    try {
      // Here you would call the backend to remove the liquidity position
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove the position from the list
      setLiquidityPositions(liquidityPositions.filter(pos => pos.id !== id));
      
      // Refresh balance
      await getCkBTCBalance();
    } catch (error) {
      console.error("Error removing liquidity position:", error);
      setError("Failed to remove liquidity position. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-center">
              Boost Liquidity Pool
            </h1>
            <p className="text-gray-400 text-center mt-2">
              Provide liquidity to the ckBTC pool and earn fees
            </p>
          </motion.div>

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="relative backdrop-blur-md overflow-hidden shadow-xl border-gray-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 -z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 -z-10"></div>
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Your ckBTC Balance</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchData}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    disabled={isBalanceLoading}
                  >
                    {isBalanceLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center border border-orange-500/30">
                    <img 
                      src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" 
                      alt="ckBTC Logo" 
                      className="h-6 w-6"
                    />
                  </div>
                  <div>
                    {isBalanceLoading ? (
                      <BalanceSkeleton />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-white">{ckbtcBalance.toFixed(8)} <span className="text-gray-400 text-lg">ckBTC</span></p>
                        <p className="text-sm text-gray-400">Available for providing liquidity</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Liquidity Positions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="relative backdrop-blur-md overflow-hidden shadow-xl border-gray-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 -z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 -z-10"></div>
              
              <CardHeader className="pb-4">
                <h2 className="text-xl font-bold text-white">Your Liquidity Positions</h2>
              </CardHeader>
              
              <CardContent>
                {liquidityPositions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">You don't have any liquidity positions yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Create one below to start earning fees.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liquidityPositions.map((position) => (
                      <div key={position.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-lg font-medium text-white">{position.amount.toFixed(8)} ckBTC</p>
                            <p className="text-sm text-gray-400">Fee: {position.percentage.toFixed(1)}%</p>
                          </div>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleRemovePosition(position.id)}
                            disabled={isRemoving}
                            className="bg-red-900/50 hover:bg-red-800 text-red-300 border border-red-700/30"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Created</p>
                            <p className="text-gray-300">{formatDate(position.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Earnings</p>
                            <p className="text-green-400">{position.earnings.toFixed(8)} ckBTC</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Create New Liquidity Position */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="relative backdrop-blur-md overflow-hidden shadow-xl border-gray-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 -z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 -z-10"></div>
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Create New Liquidity Position</h2>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label htmlFor="amount" className="block text-sm font-medium text-blue-300">
                      Amount (ckBTC)
                    </label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        step="0.00000001"
                        min="0.00000001"
                        placeholder="0.00000001"
                        value={amount}
                        onChange={handleAmountChange}
                        className="pl-4 pr-16 border-gray-700/50 bg-gray-800/50 focus:border-blue-500 focus:ring-blue-500/50 h-12 rounded-lg"
                        disabled={isCreating || isBalanceLoading}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <span className="text-gray-400 font-medium">ckBTC</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">
                        Available: {isBalanceLoading ? "Loading..." : ckbtcBalance.toFixed(8)} ckBTC
                      </span>
                      <button 
                        type="button" 
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => setAmount(ckbtcBalance.toString())}
                        disabled={isCreating || isBalanceLoading || ckbtcBalance === 0}
                      >
                        Max
                      </button>
                    </div>
                  </div>
                  
                  {/* Fee Percentage Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-blue-300">
                        Fee Percentage
                      </label>
                      <span className="text-white font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <Slider
                      defaultValue={[0.5]}
                      min={0.1}
                      max={2}
                      step={0.1}
                      value={[percentage]}
                      onValueChange={handlePercentageChange}
                      disabled={isCreating}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0.1%</span>
                      <span>2%</span>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 flex gap-2 items-start">
                      <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-300 font-medium">Fee Information</p>
                        <p className="text-xs text-blue-200/70 mt-1">
                          Higher fees may attract fewer transactions but earn more per transaction.
                          Lower fees may attract more transactions but earn less per transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 flex gap-2 items-start">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300">
                        {error}
                      </p>
                    </div>
                  )}
                  
                  {/* Create Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/20 py-5 text-base rounded-xl"
                    onClick={handleCreatePosition}
                    disabled={isCreating || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > ckbtcBalance || isBalanceLoading}
                  >
                    {isCreating ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Create Liquidity Position
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
              
              <CardFooter className="border-t border-gray-800/50 pt-4">
                <div className="text-xs text-gray-400 text-center w-full">
                  By creating a liquidity position, you agree to the terms and conditions of the ckBTC Boost Liquidity Pool.
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