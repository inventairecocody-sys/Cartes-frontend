import React from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  gradient?: "orange" | "blue" | "green";
  size?: "sm" | "md" | "lg";
  centered?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle,
  icon = "📋",
  gradient = "orange",
  size = "md",
  centered = false
}) => {
  // Configuration des gradients
  const gradientConfig = {
    orange: "from-[#F77F00] to-[#FF9E40]",
    blue: "from-[#0077B6] to-[#2E8B57]",
    green: "from-[#2E8B57] to-[#0077B6]"
  };

  // Configuration des tailles
  const sizeConfig = {
    sm: {
      title: "text-xl",
      subtitle: "text-sm",
      padding: "py-3",
      icon: "text-lg"
    },
    md: {
      title: "text-2xl",
      subtitle: "text-base",
      padding: "py-4",
      icon: "text-xl"
    },
    lg: {
      title: "text-3xl",
      subtitle: "text-lg",
      padding: "py-5",
      icon: "text-2xl"
    }
  };

  const { title: titleSize, subtitle: subtitleSize, padding, icon: iconSize } = sizeConfig[size];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-gradient-to-r ${gradientConfig[gradient]} text-white shadow-lg rounded-2xl mb-6 ${padding} ${
        centered ? 'text-center' : ''
      }`}
    >
      <div className="container mx-auto px-6">
        <div className={`flex items-center gap-4 ${centered ? 'justify-center' : ''}`}>
          {/* Icône */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"
          >
            <span className={iconSize}>{icon}</span>
          </motion.div>

          {/* Contenu texte */}
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`font-bold ${titleSize} leading-tight`}
            >
              {title}
            </motion.h1>
            
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-white/90 mt-1 ${subtitleSize} ${centered ? 'max-w-2xl mx-auto' : ''}`}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </div>

        {/* Barre de progression décorative */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="h-1 bg-white/30 rounded-full mt-4 overflow-hidden"
        >
          <div className="h-full bg-white/50 animate-pulse w-1/3"></div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;