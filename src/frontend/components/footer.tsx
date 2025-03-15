import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="bg-black py-12 text-gray-300 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-dark-blue bg-gradient-animated opacity-10" />
      
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <motion.div
              className="mb-4 flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-blue-purple glow">
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
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gradient">ckBoost</h3>
            </motion.div>
            <motion.p
              className="mb-4 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Fast Bitcoin to ckBTC conversion for the Internet Computer ecosystem.
            </motion.p>
          </div>
          
          <div>
            <motion.h4
              className="mb-4 text-lg font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Resources
            </motion.h4>
            <motion.ul
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {["Documentation", "API Reference", "GitHub Repository", "Status"].map((item, index) => (
                <li key={index}>
                  <motion.a 
                    href="#" 
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors relative group"
                    whileHover={{ x: 5 }}
                  >
                    {item}
                    <motion.span 
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                    />
                  </motion.a>
                </li>
              ))}
            </motion.ul>
          </div>
          
          <div>
            <motion.h4
              className="mb-4 text-lg font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Community
            </motion.h4>
            <motion.ul
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {["Discord", "Twitter", "Forum", "Blog"].map((item, index) => (
                <li key={index}>
                  <motion.a 
                    href="#" 
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors relative group"
                    whileHover={{ x: 5 }}
                  >
                    {item}
                    <motion.span 
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                    />
                  </motion.a>
                </li>
              ))}
            </motion.ul>
          </div>
          
          <div>
            <motion.h4
              className="mb-4 text-lg font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Legal
            </motion.h4>
            <motion.ul
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item, index) => (
                <li key={index}>
                  <motion.a 
                    href="#" 
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors relative group"
                    whileHover={{ x: 5 }}
                  >
                    {item}
                    <motion.span 
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                    />
                  </motion.a>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
        
        <motion.div
          className="mt-12 border-t border-gray-900 pt-8 text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-gray-500">&copy; {new Date().getFullYear()} ckBoost. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
} 