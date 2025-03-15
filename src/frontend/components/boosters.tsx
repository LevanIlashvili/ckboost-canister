import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const boosters = [
  {
    id: "1",
    name: "FastBoost",
    ckbtcBalance: 25.45,
    totalBoosted: 156.78,
    feePercentage: 0.5,
    averageTime: "2 min",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "QuickSwap",
    ckbtcBalance: 18.32,
    totalBoosted: 98.45,
    feePercentage: 0.4,
    averageTime: "3 min",
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "ICPBooster",
    ckbtcBalance: 32.67,
    totalBoosted: 203.12,
    feePercentage: 0.6,
    averageTime: "1.5 min",
    status: "ACTIVE",
  },
  {
    id: "4",
    name: "CryptoAccel",
    ckbtcBalance: 15.89,
    totalBoosted: 87.34,
    feePercentage: 0.45,
    averageTime: "2.5 min",
    status: "ACTIVE",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Boosters() {
  return (
    <section id="boosters" className="bg-black py-20 md:py-28 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-blue-purple bg-gradient-animated opacity-10" />
      
      {/* Animated dots */}
      <div className="animated-dots">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="dot"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 10 + 15}s`,
            }}
          />
        ))}
      </div>
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            className="mb-4 text-3xl font-bold tracking-tight text-gradient md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Active Boosters
          </motion.h2>
          <motion.p
            className="mb-12 text-lg text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            These service providers are ready to boost your BTC to ckBTC conversion.
          </motion.p>
        </div>
        
        <motion.div
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {boosters.map((booster, index) => (
            <motion.div key={index} variants={item}>
              <Card 
                isHoverable 
                variant="bordered" 
                className="bg-glass hover-lift card-hover"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <span>{booster.name}</span>
                    <span className="inline-flex items-center rounded-full bg-green-900/50 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-800">
                      Active
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "ckBTC Balance:", value: `₿ ${booster.ckbtcBalance.toFixed(2)}` },
                      { label: "Total Boosted:", value: `₿ ${booster.totalBoosted.toFixed(2)}` },
                      { label: "Fee:", value: `${booster.feePercentage}%` },
                      { label: "Avg. Time:", value: booster.averageTime }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-sm text-gray-400">{item.label}</span>
                        <span className="font-medium text-white">{item.value}</span>
                      </div>
                    ))}
                    <div className="pt-4">
                      <motion.div
                        whileHover={{ 
                          boxShadow: "0 0 20px rgba(147, 51, 234, 0.5)"
                        }}
                      >
                        <Button 
                          className="w-full bg-gradient-blue-purple hover:opacity-90 glow-purple hover-lift"
                        >
                          Select Booster
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-800 text-gray-300 hover:bg-gray-900 hover-lift glow-border"
            >
              Become a Booster
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 