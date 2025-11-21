import React from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  color?: "orange" | "blue" | "green" | "red" | "gray";
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  text, 
  onClick, 
  color = "orange",
  size = "md",
  variant = "solid",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false
}) => {
  // Configuration des couleurs
  const colorConfig = {
    orange: {
      solid: "bg-gradient-to-r from-[#F77F00] to-[#FF9E40] hover:from-[#e46f00] hover:to-[#FF8C00] text-white shadow-lg hover:shadow-xl",
      outline: "border-2 border-[#F77F00] text-[#F77F00] hover:bg-[#F77F00] hover:text-white",
      ghost: "text-[#F77F00] hover:bg-orange-50"
    },
    blue: {
      solid: "bg-gradient-to-r from-[#0077B6] to-[#2E8B57] hover:from-[#0056b3] hover:to-[#1e6b3e] text-white shadow-lg hover:shadow-xl",
      outline: "border-2 border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white",
      ghost: "text-[#0077B6] hover:bg-blue-50"
    },
    green: {
      solid: "bg-gradient-to-r from-[#2E8B57] to-[#0077B6] hover:from-[#1e6b3e] hover:to-[#0056b3] text-white shadow-lg hover:shadow-xl",
      outline: "border-2 border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57] hover:text-white",
      ghost: "text-[#2E8B57] hover:bg-green-50"
    },
    red: {
      solid: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl",
      outline: "border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
      ghost: "text-red-500 hover:bg-red-50"
    },
    gray: {
      solid: "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl",
      outline: "border-2 border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white",
      ghost: "text-gray-500 hover:bg-gray-50"
    }
  };

  // Configuration des tailles
  const sizeConfig = {
    sm: "px-3 py-2 text-sm rounded-xl",
    md: "px-6 py-3 text-base rounded-2xl",
    lg: "px-8 py-4 text-lg rounded-2xl"
  };

  const baseClasses = `
    font-semibold transition-all duration-300 flex items-center justify-center gap-3
    ${sizeConfig[size]}
    ${colorConfig[color][variant]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={baseClasses.trim()}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {icon && <span className="text-lg">{icon}</span>}
          <span>{text}</span>
        </>
      )}
    </motion.button>
  );
};

export default Button;