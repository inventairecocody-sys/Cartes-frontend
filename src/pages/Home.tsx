import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import MotivationQuotes from "../components/MotivationQuotes";
import WelcomeMessage from "../components/WelcomeMessage";
import CoordinationInfo from "../components/CoordinationInfo";

const Home: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const nomComplet = localStorage.getItem("NomComplet") || "";
  const agence = localStorage.getItem("Agence") || "";
  const role = localStorage.getItem("role") || "";

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar role={role} />
      
      {/* ✅ CITATIONS DE MOTIVATION EN HAUT */}
      <MotivationQuotes />
      
      {/* 🎯 EN-TÊTE AVEC STYLE ORANGE AMÉLIORÉ */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-6 shadow-lg"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                <span className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">🏠</span>
                Tableau de Bord Principal
              </h1>
              <div className="text-white/90 text-lg space-y-1">
                <p className="flex items-center gap-2">
                  <span className="text-xl">👋</span>
                  Bienvenue, <span className="font-semibold text-white">{nomComplet}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                    <span>🏢</span> {agence}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                    <span>🎯</span> {role}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                    COORDINATION ABIDJAN NORD-COCODY
                  </span>
                </div>
              </div>
            </div>
            
            {/* 📅 DATE ET HEURE AMÉLIORÉE */}
            <motion.div 
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[200px] border border-white/30"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/90 mb-1">
                <span>📅</span>
                {currentTime.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {currentTime.toLocaleTimeString('fr-FR')}
              </div>
              <div className="text-xs text-white/70 mt-1">
                Mise à jour en temps réel
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 md:px-6 py-8">
        
        {/* 🔍 NOUVEAU LIEN RECHERCHE ULTRA-PROFESSIONNEL */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <Link to="/inventaire">
            <motion.div
              whileHover={{ 
                scale: 1.02,
                y: -2,
                boxShadow: "0 12px 40px rgba(0, 119, 182, 0.15)"
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white rounded-2xl p-5 shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* EFFET DE SURVOL ÉLÉGANT */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* CONTENU PRINCIPAL */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* ICÔNE ANIMÉE */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0077B6] to-[#00A8E8] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200 transition-shadow duration-300">
                      <span className="text-white text-lg">🔍</span>
                    </div>
                    {/* POINT D'ANIMATION */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white group-hover:animate-ping"></div>
                  </div>
                  
                  {/* TEXTE */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#0077B6] transition-colors duration-300">
                      Recherche Avancée
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      Accès direct à l'outil de recherche
                    </p>
                  </div>
                </div>
                
                {/* FLÈCHE ANIMÉE */}
                <div className="text-gray-400 group-hover:text-[#0077B6] transform group-hover:translate-x-1 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* CHAMPS DE RECHERCHE DISPONIBLES */}
              <div className="relative z-10 mt-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: "👤", label: "Nom" },
                    { icon: "📞", label: "Contact" },
                    { icon: "🏢", label: "Site" },
                    { icon: "🗺️", label: "Lieu" },
                    { icon: "🎂", label: "Date" },
                    { icon: "📦", label: "Rangement" }
                  ].map((field, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-xs text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-all duration-300"
                    >
                      <span className="text-xs">{field.icon}</span>
                      <span>{field.label}</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  + de nombreux autres critères disponibles
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.section>

        {/* 🎴 SECTION PRINCIPALE - 2 COLONNES AVEC ANIMATION */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* COLONNE GAUCHE - MESSAGE DE BIENVENUE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <WelcomeMessage />
          </motion.div>

          {/* COLONNE DROITE - INFORMATIONS COORDINATION */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <CoordinationInfo />
          </motion.div>
        </motion.div>

        {/* ✅ SECTION RECHERCHE AVANCÉE AMÉLIORÉE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-5xl mx-auto mb-8"
        >
          <div className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            {/* EFFET DE BRILLANCE */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            
            <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-4xl">🔍</span>
              </div>
              
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3">Recherche Avancée des Cartes</h2>
                <p className="text-blue-100 text-lg mb-6 max-w-2xl leading-relaxed">
                  Accédez à notre outil de recherche performant pour trouver rapidement les cartes grâce à des critères multiples et précis.
                </p>
              </div>

              {/* GRILLE AMÉLIORÉE */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full max-w-3xl">
                {[
                  { icon: "👤", text: "Nom/Prénom", color: "from-blue-400 to-blue-600" },
                  { icon: "📞", text: "Contact", color: "from-green-400 to-green-600" },
                  { icon: "🏢", text: "Site Retrait", color: "from-purple-400 to-purple-600" },
                  { icon: "🗺️", text: "Lieu Naissance", color: "from-orange-400 to-orange-600" },
                  { icon: "🎂", text: "Date Naissance", color: "from-pink-400 to-pink-600" },
                  { icon: "📦", text: "Rangement", color: "from-indigo-400 to-indigo-600" },
                  { icon: "📊", text: "Filtres Avancés", color: "from-teal-400 to-teal-600" },
                  { icon: "💾", text: "Export Excel", color: "from-red-400 to-red-600" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm border border-white/20"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-xs font-medium text-white/90">{item.text}</div>
                  </motion.div>
                ))}
              </div>

              <Link to="/inventaire" className="w-full max-w-md">
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 30px rgba(0, 119, 182, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white text-[#0077B6] px-8 py-5 rounded-xl font-bold text-xl hover:bg-gray-50 transition-all duration-300 shadow-lg flex items-center justify-center gap-4 border border-blue-200"
                >
                  <span className="text-2xl">🚀</span>
                  Accéder à la Recherche Avancée
                  <span className="text-2xl">→</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* 📋 INFORMATIONS DE CONTACT AMÉLIORÉES */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🏢</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Coordination ABIDJAN NORD-COCODY</h3>
                <p className="text-gray-600 text-sm">Votre partenaire de confiance</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  icon: "📞", 
                  title: "07 76 73 51 15", 
                  subtitle: "Contact Direct",
                  color: "bg-orange-50 border-orange-200",
                  iconColor: "text-[#F77F00]"
                },
                { 
                  icon: "👤", 
                  title: "ÉliteMultiservices", 
                  subtitle: "Gestionnaire",
                  color: "bg-blue-50 border-blue-200", 
                  iconColor: "text-[#0077B6]"
                },
                { 
                  icon: "✅", 
                  title: "Système Opérationnel", 
                  subtitle: "Statut Plateforme",
                  color: "bg-green-50 border-green-200",
                  iconColor: "text-[#2E8B57]"
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className={`${item.color} rounded-xl p-4 border text-center`}
                >
                  <div className={`text-2xl mb-2 ${item.iconColor}`}>{item.icon}</div>
                  <div className="font-semibold text-gray-800 text-lg">{item.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{item.subtitle}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;