import { motion } from "framer-motion";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Users } from "lucide-react";

export function BecomeBoosterPage() {
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
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium tracking-wide">
                Join the Booster Network
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
              Become a Booster
            </h1>
            <p className="text-lg text-white/60 leading-relaxed">
              Help others convert their Bitcoin to ckBTC faster and earn fees for your service.
              Join our network of trusted boosters today.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 