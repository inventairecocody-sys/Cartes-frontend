import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "orange" | "blue" | "green" | "red" | "purple";
  icon?: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "gradient" | "outline";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle,
  color = "blue",
  icon,
  size = "md",
  variant = "solid",
  trend,
  loading = false
}) => {
  // Configuration des couleurs
  const colorConfig = {
    orange: {
      solid: "bg-orange-50 border-orange-200 text-orange-800",
      gradient: "bg-gradient-to-br from-[#F77F00] to-[#FF9E40] text-white",
      outline: "bg-white border-2 border-[#F77F00] text-[#F77F00]"
    },
    blue: {
      solid: "bg-blue-50 border-blue-200 text-blue-800",
      gradient: "bg-gradient-to-br from-[#0077B6] to-[#2E8B57] text-white",
      outline: "bg-white border-2 border-[#0077B6] text-[#0077B6]"
    },
    green: {
      solid: "bg-green-50 border-green-200 text-green-800",
      gradient: "bg-gradient-to-br from-[#2E8B57] to-[#0077B6] text-white",
      outline: "bg-white border-2 border-[#2E8B57] text-[#2E8B57]"
    },
    red: {
      solid: "bg-red-50 border-red-200 text-red-800",
      gradient: "bg-gradient-to-br from-red-500 to-red-600 text-white",
      outline: "bg-white border-2 border-red-500 text-red-500"
    },
    purple: {
      solid: "bg-purple-50 border-purple-200 text-purple-800",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
      outline: "bg-white border-2 border-purple-500 text-purple-500"
    }
  };

  // Configuration des tailles
  const sizeConfig = {
    sm: {
      padding: "p-4",
      title: "text-xs font-medium",
      value: "text-xl font-bold",
      subtitle: "text-xs",
      icon: "text-lg"
    },
    md: {
      padding: "p-6",
      title: "text-sm font-semibold",
      value: "text-2xl font-bold",
      subtitle: "text-sm",
      icon: "text-2xl"
    },
    lg: {
      padding: "p-8",
      title: "text-base font-semibold",
      value: "text-3xl font-bold",
      subtitle: "text-base",
      icon: "text-3xl"
    }
  };

  const { padding, title: titleSize, value: valueSize, subtitle: subtitleSize, icon: iconSize } = sizeConfig[size];
  const colorStyles = colorConfig[color][variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: loading ? 1 : 1.02,
        y: -2
      }}
      className={`
        rounded-2xl shadow-lg transition-all duration-300 border
        ${padding} ${colorStyles}
        ${loading ? 'opacity-70' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Titre */}
          <h3 className={`${titleSize} mb-2 opacity-90`}>
            {title}
          </h3>
          
          {/* Valeur */}
          {loading ? (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 border-2 ${
                variant === "gradient" ? "border-white" : "border-current"
              } border-t-transparent rounded-full animate-spin`}></div>
              <span className={valueSize}>Chargement...</span>
            </div>
          ) : (
            <p className={`${valueSize} mb-1`}>
              {value}
            </p>
          )}
          
          {/* Sous-titre */}
          {subtitle && (
            <p className={`${subtitleSize} opacity-80 mt-1`}>
              {subtitle}
            </p>
          )}
          
          {/* Trend indicator */}
          {trend && !loading && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        
        {/* Icône */}
        {icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`
              ${iconSize} opacity-90
              ${variant === "gradient" ? '' : 'opacity-70'}
            `}
          >
            {icon}
          </motion.div>
        )}
      </div>

      {/* Barre de progression décorative */}
      {variant === "gradient" && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 1 }}
          className="h-1 bg-white/30 rounded-full mt-4 overflow-hidden"
        >
          <div className="h-full bg-white/50 animate-pulse w-1/3"></div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatCard;