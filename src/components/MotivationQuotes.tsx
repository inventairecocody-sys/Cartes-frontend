import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotivationQuotes: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  const quotes = [
    "« Ensemble, allons plus loin. »",
    "« Chaque carte distribuée rapproche notre objectif. »",
    "« Votre engagement fait la différence. »",
    "« Restons concentrés, restons efficaces. »",
    "« Une équipe soudée réussit toujours. »",
    "« Le professionnalisme est notre force. »",
    "« Aujourd'hui, faisons mieux qu'hier. »",
    "« Petit effort, grand résultat. »"
  ];

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 10000); // 10 secondes par citation
    return () => clearInterval(quoteTimer);
  }, [quotes.length]);

  return (
    <div className="bg-gradient-to-r from-[#2E8B57] to-[#0077B6] text-white py-3">
      <div className="container mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={quoteIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">💫</span>
              <p className="text-lg font-medium italic">{quotes[quoteIndex]}</p>
              <span className="text-xl">💫</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MotivationQuotes;