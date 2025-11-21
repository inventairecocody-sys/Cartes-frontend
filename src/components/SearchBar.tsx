import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "outline";
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Rechercher des cartes...",
  size = "md",
  variant = "default",
  className = ""
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  // Configuration des tailles
  const sizeConfig = {
    sm: "px-4 py-2 text-sm rounded-xl",
    md: "px-6 py-3 text-base rounded-2xl",
    lg: "px-8 py-4 text-lg rounded-2xl"
  };

  // Configuration des variants
  const variantConfig = {
    default: "bg-white border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100",
    filled: "bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100",
    outline: "bg-transparent border-2 border-gray-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
  };

  const baseClasses = `
    w-full transition-all duration-300 font-medium
    placeholder-gray-400 text-gray-800
    ${sizeConfig[size]}
    ${variantConfig[variant]}
    ${className}
  `;

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{ 
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused ? "0 10px 25px -5px rgba(247, 127, 0, 0.1)" : "none"
        }}
        className="relative"
      >
        {/* Icône de recherche */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <motion.span
            animate={{ rotate: isFocused ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            🔍
          </motion.span>
        </div>

        {/* Champ de recherche */}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`${baseClasses} ${query ? 'pl-12 pr-12' : 'pl-12 pr-6'}`}
        />

        {/* Bouton de suppression */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              type="button"
            >
              <span className="text-lg">×</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Indicateur de résultats (optionnel) */}
      {query && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 left-0 text-xs text-gray-500 font-medium"
        >
          🔎 Recherche en cours...
        </motion.div>
      )}

      {/* Effet de focus décoratif */}
      <motion.div
        initial={false}
        animate={{ 
          scale: isFocused ? 1 : 0.8,
          opacity: isFocused ? 1 : 0
        }}
        className="absolute inset-0 bg-gradient-to-r from-orange-100 to-transparent rounded-2xl -z-10 blur-sm"
      />
    </div>
  );
};

export default SearchBar;