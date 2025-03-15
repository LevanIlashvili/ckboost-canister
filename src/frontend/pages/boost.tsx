import { motion } from "framer-motion";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Zap } from "lucide-react";

export function BoostPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-700/30 mb-4">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium tracking-wide">
                10x Faster Conversion
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
              Boost Your Bitcoin to ckBTC
            </h1>
            <p className="text-lg text-white/60 leading-relaxed">
              Skip the traditional 1-hour wait time and convert your Bitcoin to ckBTC in just minutes.
              Get instant access to the Internet Computer ecosystem.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 