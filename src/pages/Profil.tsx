import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";

interface UserProfile {
  id: number;
  NomUtilisateur: string;
  NomComplet: string;
  Email: string;
  Agence: string;
  Role: string;
}

const Profil: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "";

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/profil', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du profil');
      }

      const userData = await response.json();
      setProfile(userData);
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setChangingPassword(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/profil/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de mot de passe');
      }

      setSuccess('✅ Mot de passe modifié avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(`❌ ${err.message || 'Erreur lors du changement de mot de passe'}`);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("NomUtilisateur");
    setShowLogoutConfirm(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navbar role={role} />
        <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
          <div className="container mx-auto px-6">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="bg-white/20 p-2 rounded-xl">👤</span>
              Mon Profil
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-6 py-12">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium text-lg">Chargement du profil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar role={role} />
      
      {/* 🎯 EN-TÊTE AVEC STYLE ORANGE */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
        <div className="container mx-auto px-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="bg-white/20 p-2 rounded-xl">👤</span>
            Mon Profil Utilisateur
          </h1>
          <p className="text-white/90 mt-1 text-sm">
            Gestion de votre compte et sécurité - COORDINATION ABIDJAN NORD-COCODY
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6">
        {/* 📱 MESSAGES D'ALERTE */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3"
          >
            <span className="text-lg">⚠️</span>
            <span className="flex-1">{error}</span>
            <button 
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 text-lg font-bold"
            >
              ×
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3"
          >
            <span className="text-lg">✅</span>
            <span className="flex-1">{success}</span>
            <button 
              onClick={() => setSuccess('')}
              className="text-green-500 hover:text-green-700 text-lg font-bold"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* 🎴 LAYOUT PRINCIPAL - 2 COLONNES */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* 📋 COLONNE INFORMATIONS PERSONNELLES */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-6 h-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Informations Personnelles</h2>
                  <p className="text-gray-600 text-sm">Détails de votre compte</p>
                </div>
              </div>
              
              {profile && (
                <div className="space-y-4">
                  {/* NOM D'UTILISATEUR */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="text-[#F77F00]">👤</span> Nom d'utilisateur
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium">
                      {profile.NomUtilisateur}
                    </div>
                  </div>

                  {/* NOM COMPLET */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="text-[#0077B6]">🏷️</span> Nom complet
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium">
                      {profile.NomComplet}
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="text-[#2E8B57]">📧</span> Email
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium">
                      {profile.Email}
                    </div>
                  </div>

                  {/* AGENCE */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="text-[#F77F00]">🏢</span> Agence
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium">
                      {profile.Agence}
                    </div>
                  </div>

                  {/* RÔLE */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="text-[#0077B6]">🎯</span> Rôle
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium">
                      {profile.Role}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* 🔐 COLONNE SÉCURITÉ */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-6 h-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🔒</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Sécurité du Compte</h2>
                  <p className="text-gray-600 text-sm">Gestion du mot de passe</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* MOT DE PASSE ACTUEL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-[#F77F00]">🔑</span> Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300"
                    required
                    placeholder="Entrez votre mot de passe actuel"
                  />
                </div>

                {/* NOUVEAU MOT DE PASSE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-[#0077B6]">🆕</span> Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                    required
                    placeholder="Minimum 6 caractères"
                  />
                  <p className="text-xs text-gray-500 mt-2">Le mot de passe doit contenir au moins 6 caractères</p>
                </div>

                {/* CONFIRMATION */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-[#2E8B57]">✅</span> Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all duration-300"
                    required
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </div>

                {/* BOUTON CHANGEMENT MOT DE PASSE */}
                <motion.button
                  type="submit"
                  disabled={changingPassword}
                  whileHover={{ scale: changingPassword ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl hover:from-[#e46f00] hover:to-[#FF8C00] disabled:opacity-50 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mt-4"
                >
                  {changingPassword ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Modification en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🔄</span>
                      <span>Changer le mot de passe</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* BOUTON DÉCONNEXION */}
              <div className="mt-6 pt-6 border-t border-orange-100">
                <motion.button
                  onClick={handleLogoutClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <span className="text-lg">🚪</span>
                  <span>Se déconnecter</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 📊 CARTE STATISTIQUES */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📈</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Résumé du Profil</h2>
                <p className="text-gray-600 text-sm">Aperçu de votre compte</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CARTE UTILISATEUR */}
              <div className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Utilisateur</p>
                    <p className="text-xl font-bold mt-1">{profile.NomUtilisateur}</p>
                  </div>
                  <div className="text-2xl bg-white/20 p-3 rounded-xl">👤</div>
                </div>
              </div>

              {/* CARTE AGENCE */}
              <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Agence</p>
                    <p className="text-xl font-bold mt-1">{profile.Agence}</p>
                  </div>
                  <div className="text-2xl bg-white/20 p-3 rounded-xl">🏢</div>
                </div>
              </div>

              {/* CARTE RÔLE */}
              <div className="bg-gradient-to-r from-[#2E8B57] to-[#0077B6] text-white rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Rôle</p>
                    <p className="text-xl font-bold mt-1">{profile.Role}</p>
                  </div>
                  <div className="text-2xl bg-white/20 p-3 rounded-xl">🎯</div>
                </div>
              </div>
            </div>

            {/* INFORMATIONS COMPLÉMENTAIRES */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-4 border border-blue-100">
                <p className="text-sm text-gray-600 font-medium">📧 Email de contact</p>
                <p className="font-semibold text-gray-800 text-lg mt-1">{profile.Email}</p>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl p-4 border border-orange-100">
                <p className="text-sm text-gray-600 font-medium">🏷️ Nom complet</p>
                <p className="font-semibold text-gray-800 text-lg mt-1">{profile.NomComplet}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ℹ️ CARTE INFORMATIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">💡</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Conseils de sécurité</h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
                  <span>Utilisez un mot de passe fort et unique</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
                  <span>Changez régulièrement votre mot de passe</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
                  <span>Ne partagez jamais vos identifiants de connexion</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
                  <span>Déconnectez-vous après chaque session</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MODAL DE CONFIRMATION DE DÉCONNEXION */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-auto border border-orange-100"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🚪</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Confirmer la déconnexion
              </h3>
              
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>

              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={cancelLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                >
                  Annuler
                </motion.button>
                <motion.button
                  onClick={confirmLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg"
                >
                  Se déconnecter
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profil;