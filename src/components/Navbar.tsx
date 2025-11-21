import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  role?: string;
}

const Navbar: React.FC<NavbarProps> = ({ role }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const userRole = role || localStorage.getItem("role") || "Operateur";

  const handleAccueilClick = (e: React.MouseEvent) => {
    if (location.pathname === "/home" || location.pathname === "/dashboard") {
      e.preventDefault();
      window.location.reload();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  // ✅ CONFIGURATION DES ACCÈS PAR RÔLE
  const canAccessDashboard = ["Administrateur"].includes(userRole);
  const canAccessJournal = ["Administrateur"].includes(userRole);
  const canAccessProfil = true; // Tous les rôles ont accès au profil

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center">
              <div className="text-left">
                <span className="text-xl font-bold bg-gradient-to-r from-[#F77F00] to-[#0077B6] bg-clip-text text-transparent">
                  Gestion des Cartes ABIDJAN NORD-COCODY
                </span>
                <span className="block text-xs text-gray-500 mt-[-2px]">
                  by ÉliteMultiservices - 07 76 73 51 15
                </span>
              </div>
            </div>

            {/* Menu de navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Accueil - TOUS LES RÔLES */}
              <Link
                to="/home"
                onClick={handleAccueilClick}
                className={`relative px-4 py-2 rounded-xl transition-all duration-300 font-semibold ${
                  isActiveLink("/home")
                    ? "text-white bg-gradient-to-r from-[#F77F00] to-[#FF9E40] shadow-lg"
                    : "text-gray-700 hover:text-[#F77F00] hover:bg-orange-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🏠</span>
                  <span>Accueil</span>
                </span>
              </Link>

              {/* Recherche - TOUS LES RÔLES */}
              <Link
                to="/inventaire"
                className={`relative px-4 py-2 rounded-xl transition-all duration-300 font-semibold ${
                  isActiveLink("/inventaire")
                    ? "text-white bg-gradient-to-r from-[#0077B6] to-[#2E8B57] shadow-lg"
                    : "text-gray-700 hover:text-[#0077B6] hover:bg-blue-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🔍</span>
                  <span>Recherche</span>
                </span>
              </Link>

              {/* Tableau de Bord - ADMINISTRATEUR SEULEMENT */}
              {canAccessDashboard && (
                <Link
                  to="/dashboard"
                  className={`relative px-4 py-2 rounded-xl transition-all duration-300 font-semibold ${
                    isActiveLink("/dashboard")
                      ? "text-white bg-gradient-to-r from-[#2E8B57] to-[#0077B6] shadow-lg"
                      : "text-gray-700 hover:text-[#2E8B57] hover:bg-green-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>📊</span>
                    <span>Tableau de Bord</span>
                  </span>
                </Link>
              )}

              {/* Journal - ADMINISTRATEUR SEULEMENT */}
              {canAccessJournal && (
                <Link
                  to="/journal"
                  className={`relative px-4 py-2 rounded-xl transition-all duration-300 font-semibold ${
                    isActiveLink("/journal")
                      ? "text-white bg-gradient-to-r from-[#F77F00] to-[#0077B6] shadow-lg"
                      : "text-gray-700 hover:text-[#F77F00] hover:bg-orange-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>📖</span>
                    <span>Journal</span>
                  </span>
                </Link>
              )}

              {/* Profil - TOUS LES RÔLES */}
              {canAccessProfil && (
                <Link
                  to="/profil"
                  className={`relative px-4 py-2 rounded-xl transition-all duration-300 font-semibold ${
                    isActiveLink("/profil")
                      ? "text-white bg-gradient-to-r from-[#F77F00] to-[#0077B6] shadow-lg"
                      : "text-gray-700 hover:text-[#F77F00] hover:bg-orange-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>👤</span>
                    <span>Profil</span>
                  </span>
                </Link>
              )}
            </div>

            {/* Menu Burger - Mobile */}
            <div className="md:hidden">
              <motion.button
                onClick={toggleMenu}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white shadow-lg"
              >
                {isMenuOpen ? '✕' : '☰'}
              </motion.button>
            </div>
          </div>

          {/* Menu Mobile */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 mt-2 overflow-hidden"
              >
                <div className="py-4 space-y-2">
                  {/* Accueil Mobile - TOUS LES RÔLES */}
                  <Link
                    to="/home"
                    onClick={(e) => {
                      handleAccueilClick(e);
                      setIsMenuOpen(false);
                    }}
                    className={`block px-4 py-3 mx-2 rounded-xl transition-all duration-300 font-semibold ${
                      isActiveLink("/home")
                        ? "text-white bg-gradient-to-r from-[#F77F00] to-[#FF9E40] shadow-lg"
                        : "text-gray-700 hover:text-[#F77F00] hover:bg-orange-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>🏠</span>
                      <span>Accueil</span>
                    </span>
                  </Link>

                  {/* Recherche Mobile - TOUS LES RÔLES */}
                  <Link
                    to="/inventaire"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 mx-2 rounded-xl transition-all duration-300 font-semibold ${
                      isActiveLink("/inventaire")
                        ? "text-white bg-gradient-to-r from-[#0077B6] to-[#2E8B57] shadow-lg"
                        : "text-gray-700 hover:text-[#0077B6] hover:bg-blue-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>🔍</span>
                      <span>Recherche</span>
                    </span>
                  </Link>

                  {/* Tableau de Bord Mobile - ADMINISTRATEUR SEULEMENT */}
                  {canAccessDashboard && (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 mx-2 rounded-xl transition-all duration-300 font-semibold ${
                        isActiveLink("/dashboard")
                          ? "text-white bg-gradient-to-r from-[#2E8B57] to-[#0077B6] shadow-lg"
                          : "text-gray-700 hover:text-[#2E8B57] hover:bg-green-50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span>📊</span>
                        <span>Tableau de Bord</span>
                      </span>
                    </Link>
                  )}

                  {/* Journal Mobile - ADMINISTRATEUR SEULEMENT */}
                  {canAccessJournal && (
                    <Link
                      to="/journal"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 mx-2 rounded-xl transition-all duration-300 font-semibold ${
                        isActiveLink("/journal")
                          ? "text-white bg-gradient-to-r from-[#F77F00] to-[#0077B6] shadow-lg"
                          : "text-gray-700 hover:text-[#F77F00] hover:bg-orange-50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span>📖</span>
                        <span>Journal</span>
                      </span>
                    </Link>
                  )}

                  {/* Profil Mobile - TOUS LES RÔLES */}
                  {canAccessProfil && (
                    <Link
                      to="/profil"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 mx-2 rounded-xl transition-all duration-300 font-semibold ${
                        isActiveLink("/profil")
                          ? "text-white bg-gradient-to-r from-[#F77F00] to-[#0077B6] shadow-lg"
                          : "text-gray-700 hover:text-[#F77F00] hover:bg-orange-50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span>👤</span>
                        <span>Profil</span>
                      </span>
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
};

export default Navbar;