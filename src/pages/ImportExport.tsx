import React from "react";
import { motion } from "framer-motion"; // ✅ SUPPRESSION de Header inutilisé
import Navbar from "../components/Navbar";

const ImportExport: React.FC = () => {
  const role = localStorage.getItem("role") || "";

  if (role === "Opérateur") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navbar role={role} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-8 text-center max-w-md mx-4"
          >
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-red-600">🚫</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Accès Refusé
            </h2>
            <p className="text-red-600 font-medium">
              Vous n'avez pas les droits nécessaires pour accéder à cette page.
            </p>
            <p className="text-gray-600 text-sm mt-3">
              Contactez votre administrateur pour obtenir les autorisations.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar role={role} />
      
      {/* Header avec style orange */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
        <div className="container mx-auto px-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="bg-white/20 p-2 rounded-xl">📤📥</span>
            Import / Export des Cartes
          </h1>
          <p className="text-white/90 mt-1 text-sm">
            Gestion des données - COORDINATION ABIDJAN NORD-COCODY
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Section principale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-orange-100 p-6 md:p-8 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <span className="text-[#F77F00]">📊</span>
            Gestion des Données Cartes
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Ici, vous pourrez <span className="text-[#F77F00] font-semibold">importer</span> des cartes depuis Excel 
            ou <span className="text-[#0077B6] font-semibold">exporter</span> les cartes de la base de données 
            pour analyse et sauvegarde.
          </p>
        </motion.div>

        {/* Cartes de fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Carte Import */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📥</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Import depuis Excel</h3>
                <p className="text-sm text-gray-600">Ajoutez des cartes en masse</p>
              </div>
            </div>
            <ul className="text-sm text-gray-700 space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#0077B6] rounded-full"></div>
                Format Excel (.xlsx, .xls)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#0077B6] rounded-full"></div>
                Validation automatique des données
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#0077B6] rounded-full"></div>
                Rapport d'import détaillé
              </li>
            </ul>
            <button className="w-full py-3 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white rounded-xl hover:from-[#0056b3] hover:to-[#1e6b3e] font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
              📁 Choisir un fichier Excel
            </button>
          </motion.div>

          {/* Carte Export */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-orange-100 p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📤</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Export vers Excel</h3>
                <p className="text-sm text-gray-600">Téléchargez les données</p>
              </div>
            </div>
            <ul className="text-sm text-gray-700 space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
                Données complètes ou filtrées
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
                Format Excel optimisé
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
                Statistiques incluses
              </li>
            </ul>
            <button className="w-full py-3 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl hover:from-[#e46f00] hover:to-[#FF8C00] font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
              💾 Exporter les cartes
            </button>
          </motion.div>
        </div>

        {/* Section informations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl border border-orange-200 p-6"
        >
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-[#F77F00]">💡</span>
            Informations Importantes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-[#F77F00] rounded-full mt-2 flex-shrink-0"></div>
              <span>Vérifiez le format du fichier Excel avant import</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-[#F77F00] rounded-full mt-2 flex-shrink-0"></div>
              <span>L'export inclut toutes les données actuelles</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-[#0077B6] rounded-full mt-2 flex-shrink-0"></div>
              <span>Sauvegardez régulièrement vos données</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-[#0077B6] rounded-full mt-2 flex-shrink-0"></div>
              <span>Contactez le support en cas de problème</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImportExport;