import { motion } from "framer-motion";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useAuth } from "../lib/auth-context";

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.h1
          className="text-3xl font-bold text-gradient mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Your Profile</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Principal ID:</span>
                <span className="font-medium text-white truncate max-w-[200px]">
                  {user?.principal}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Status:</span>
                <span className="font-medium text-green-400">Active</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Your Boosts</h2>
            <div className="text-center py-8">
              <p className="text-gray-400">No boosts yet</p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 