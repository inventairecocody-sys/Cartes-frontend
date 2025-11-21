import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../service/utilisateursService";

interface LoginFormData {
  NomUtilisateur: string;
  MotDePasse: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    NomUtilisateur: "",
    MotDePasse: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errorMessage) setErrorMessage("");
  };

  const validateForm = (): boolean => {
    if (!formData.NomUtilisateur.trim()) {
      setErrorMessage("Le nom d'utilisateur est requis");
      return false;
    }
    if (!formData.MotDePasse) {
      setErrorMessage("Le mot de passe est requis");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { token, utilisateur } = await loginUser(formData);
      // ✅ STOCKAGE COMPLET DES INFORMATIONS UTILISATEUR
      localStorage.setItem("token", token);
      localStorage.setItem("role", utilisateur.Role);
      localStorage.setItem("NomUtilisateur", utilisateur.NomUtilisateur);
      localStorage.setItem("NomComplet", utilisateur.NomComplet);
      localStorage.setItem("Agence", utilisateur.Agence);
      localStorage.setItem("Email", utilisateur.Email);
      localStorage.setItem("UserId", utilisateur.id.toString());
      
      navigate("/home"); // ✅ Redirection vers la nouvelle page d'accueil
    } catch (err: any) {
      console.error("Erreur de connexion :", err);
      setErrorMessage(err?.message || "Nom d'utilisateur ou mot de passe incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* ====== HEADER AVEC PLUS D'ORANGE ====== */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 py-3">
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Logo avec accent orange */}
            <div className="relative">
              <img 
                src="/logo-placeholder.jpeg" 
                alt="Logo" 
                className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-sm"
              />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#F77F00] rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
                Gestion des Cartes
              </h1>
              <p className="text-[#F77F00] text-sm md:text-base font-semibold">
                COORDINATION ABIDJAN NORD-COCODY
              </p>
            </div>
          </div>
          
          {/* Badge plateforme avec orange */}
          <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white px-4 py-2 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">GESCARD</span>
          </div>
        </div>
        
        {/* Barre de progression avec orange dominant */}
        <div className="flex h-2 w-full bg-gradient-to-r from-[#F77F00] via-[#2E8B57] to-[#0077B6]">
          <div className="h-full bg-white/40 animate-pulse w-1/3"></div>
        </div>
      </header>

      {/* ====== CONTENU PRINCIPAL AVEC ACCENTS ORANGE ====== */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center"
          >
            {/* Zone gauche - Hero avec accents orange */}
            <div className="text-center lg:text-left space-y-6 md:space-y-8">
              {/* Illustration avec bordure orange */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-3xl p-6 md:p-8 shadow-xl border border-orange-100">
                  <img
                    src="/decorative-image.jpeg"
                    alt="Interface moderne EGC"
                    className="w-full h-48 md:h-64 object-cover rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 border-2 border-orange-200"
                  />
                  
                  {/* Points décoratifs orange */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#F77F00] rounded-full animate-bounce shadow-lg"></div>
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-[#FF9E40] rounded-full opacity-80 shadow-lg"></div>
                  <div className="absolute top-4 -left-2 w-4 h-4 bg-[#FFB74D] rounded-full animate-pulse"></div>
                </div>
              </motion.div>

              {/* Texte principal avec accent orange */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="space-y-4 md:space-y-6"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Bienvenue dans{" "}
                  <span className="bg-gradient-to-r from-[#F77F00] to-[#0077B6] bg-clip-text text-transparent">
                    GESCARD
                  </span>
                </h2>
                
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Votre solution <span className="font-semibold text-[#F77F00]">spécialisée</span> pour la gestion et la recherche rapide des cartes de la coordination.
                </p>

                {/* Features badges adaptés à la gestion de cartes */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  {["🔍 Recherche Rapide", "📊 Gestion Centralisée", "🔄 Mise à Jour Instantanée", "📈 Statistiques Détaillées"].map((feature, index) => (
                    <motion.span
                      key={feature}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm border border-orange-200 px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm"
                    >
                      {feature}
                    </motion.span>
                  ))}
                </div>

                {/* Section avantages spécifiques */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl p-4 md:p-6 border border-orange-100"
                >
                  <h4 className="font-semibold text-[#F77F00] mb-3 text-lg">🎯 Avantages Clés</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
                      <span>Recherche multicritères</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
                      <span>Base de données sécurisée</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
                      <span>Export des données</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
                      <span>Interface intuitive</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Zone droite - Formulaire avec accents orange */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative"
            >
              {/* Effet de carte moderne avec bordure orange */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-orange-100 p-6 md:p-8 lg:p-10">
                {/* En-tête formulaire avec icône orange */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="w-16 h-16 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <span className="text-2xl text-white">🔐</span>
                  </motion.div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Accès Plateforme
                  </h3>
                  <p className="text-[#F77F00] text-sm md:text-base font-medium">
                    Gérez vos cartes en toute simplicité
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Champ nom d'utilisateur avec focus orange */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="text-[#F77F00]">👤</span> Identifiant Coordination
                    </label>
                    <div className="relative">
                      <input
                        name="NomUtilisateur"
                        type="text"
                        value={formData.NomUtilisateur}
                        onChange={handleChange}
                        placeholder="Votre identifiant de coordination"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 text-gray-800 placeholder-gray-400"
                        disabled={isLoading}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-[#F77F00] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Champ mot de passe avec focus orange */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="text-[#F77F00]">🔒</span> Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        name="MotDePasse"
                        type="password"
                        value={formData.MotDePasse}
                        onChange={handleChange}
                        placeholder="Votre mot de passe sécurisé"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 text-gray-800 placeholder-gray-400"
                        disabled={isLoading}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-[#FF9E40] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Message d'erreur avec bordure orange */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-2xl text-sm text-center"
                    >
                      <span className="text-[#F77F00]">⚠️</span> {errorMessage}
                    </motion.div>
                  )}

                  {/* Bouton de connexion orange renforcé */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white font-bold rounded-2xl shadow-lg transition-all duration-300 ${
                      isLoading 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:shadow-xl hover:from-[#e46f00] hover:to-[#FF8C00] hover:shadow-orange-200"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connexion...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>📋</span>
                        <span>Accéder à la gestion</span>
                      </div>
                    )}
                  </motion.button>
                </form>

                {/* Lien mot de passe oublié avec orange */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center mt-6"
                >
                  <a
                    href="#"
                    className="text-sm text-[#F77F00] hover:text-[#e46f00] font-medium transition-colors duration-300 inline-flex items-center space-x-1"
                  >
                    <span>🔓 Identifiant ou mot de passe oublié ?</span>
                  </a>
                </motion.div>
              </div>

              {/* Éléments décoratifs orange */}
              <div className="absolute -z-10 top-4 -right-4 w-28 h-28 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-3xl opacity-30 blur-xl"></div>
              <div className="absolute -z-10 -bottom-4 -left-4 w-20 h-20 bg-[#FFB74D] rounded-3xl opacity-40 blur-lg"></div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* ====== FOOTER AVEC ACCENT ORANGE ====== */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-orange-100 py-4 md:py-6">
        <div className="text-center">
          <p className="text-gray-600 text-sm md:text-base">
            © 2025 <span className="font-bold text-[#F77F00]">GestiondesCartes (GESCARD)</span> – 
            <span className="text-gray-500"> Solution de gestion des cartes</span>
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <span className="text-xs text-[#F77F00]">🔍 Recherche avancée</span>
            <span className="text-xs text-[#F77F00]">📊 Gestion centralisée</span>
            <span className="text-xs text-[#F77F00]">🔄 Mise à jour temps réel</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;