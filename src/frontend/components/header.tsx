import { ConnectWallet, ConnectWalletButtonProps } from "@nfid/identitykit/react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";

export function Header() {
  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b border-gray-900/50 bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center justify-center rounded-full bg-gradient-blue-purple p-2 glow"
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59, 130, 246, 0.7)" }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
          </motion.div>
          <motion.h1 
            className="text-xl font-bold text-gradient"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            ckBoost
          </motion.h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          {["Features", "How It Works", "Boosters"].map((item) => (
            <motion.a 
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item}
              <motion.span 
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
              />
            </motion.a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <ConnectWallet 
            connectButtonComponent={(props: ConnectWalletButtonProps) => (
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button 
                  onClick={(event) => props.onClick!(event)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 shadow-lg shadow-blue-500/20 border-0 flex items-center gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </Button>
              </motion.div>
            )} 
          />
        </div>
      </div>
    </motion.header>
  );
} 