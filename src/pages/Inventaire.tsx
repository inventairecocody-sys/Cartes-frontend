import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import TableCartesExcel from "../components/TableCartesExcel";
import ImportModal from "../components/ImportModal";
import { updateCartes, cartesService } from "../service/CartesService";
import type { Carte } from "../service/CartesService";

const Inventaire: React.FC = () => {
  const [resultats, setResultats] = useState<Carte[]>([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [hasModifications, setHasModifications] = useState(false);
  const [totalResultats, setTotalResultats] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ✅ ÉTAT DES CRITÈRES DE RECHERCHE
  const [criteres, setCriteres] = useState({
    nom: "",
    prenom: "",
    contact: "",
    siteRetrait: "",
    lieuNaissance: "",
    dateNaissance: "",
    rangement: ""
  });

  const role = localStorage.getItem("role") || "";
  const token = localStorage.getItem("token") || "";

  // ✅ CONFIGURATION DES PERMISSIONS
  const canModifyData = ["Administrateur", "Superviseur"].includes(role);
  const canExportAll = ["Administrateur", "Superviseur"].includes(role);
  const canExportResults = ["Administrateur", "Superviseur"].includes(role);
  const canImportExcel = ["Administrateur", "Superviseur"].includes(role);

  // ✅ FONCTION DE VÉRIFICATION DU TOKEN
  const checkToken = (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expirée. Veuillez vous reconnecter.');
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  // 📢 FONCTION DE NOTIFICATION AMÉLIORÉE
  const notifyDashboardRefreshEnhanced = async () => {
    if (!checkToken()) return;
    
    console.log('📢 Notification avancée du Dashboard...');
    
    try {
      // 1. D'abord forcer le recalcul des statistiques
      await cartesService.forceRefreshAndGetStats(token);
      console.log('✅ Statistiques recalculées avec succès');
    } catch (error: any) {
      console.warn('⚠️ Recalcul des statistiques échoué, continuation...');
    }
    
    // 2. Ensuite notifier le Dashboard
    // Événement personnalisé (même onglet)
    const refreshEvent = new CustomEvent('dashboardRefreshNeeded', {
      detail: { 
        force: true, 
        timestamp: Date.now(),
        source: 'inventaire'
      }
    });
    window.dispatchEvent(refreshEvent);
    
    // localStorage (entre onglets)
    localStorage.setItem('lastDataUpdate', Date.now().toString());
    localStorage.setItem('forceStatsRefresh', 'true');
    
    // BroadcastChannel (entre onglets moderne)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('dashboard_updates');
        channel.postMessage({ 
          type: 'data_updated', 
          timestamp: Date.now(),
          forceRefresh: true,
          source: 'inventaire'
        });
        setTimeout(() => channel.close(), 1000);
      } catch (e) {
        console.log('BroadcastChannel non supporté');
      }
    }
    
    console.log('✅ Notification du Dashboard terminée');
  };

  // 🔍 RECHERCHE MULTICRITÈRES AVEC PAGINATION
  const handleRecherche = async (page: number = 1) => {
    if (!checkToken()) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(criteres).forEach(([key, value]) => {
        if (value.trim()) params.append(key, value.trim());
      });
      
      params.append('page', page.toString());
      params.append('limit', '50');

      const response = await fetch(`http://localhost:3000/api/inventaire/recherche?${params}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403 || response.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setResultats(data.cartes);
        setTotalResultats(data.total);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setHasModifications(false); // Réinitialiser les modifications après une nouvelle recherche
      } else {
        const errorData = await response.json();
        console.error("Erreur recherche:", errorData);
        alert(`Erreur lors de la recherche: ${errorData.error || 'Erreur serveur'}`);
      }
    } catch (error: any) {
      console.error("Erreur recherche:", error);
      alert("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  // 💾 FONCTION DE SAUVEGARDE CORRIGÉE - VERSION ULTIME
  const handleSaveModifications = async () => {
    if (!checkToken()) return;
    
    try {
      console.log('💾 Début de la sauvegarde des modifications...');
      
      // Compter les cartes modifiées pour le debug
      const cartesAvecDelivrance = resultats.filter(carte => 
        carte.DELIVRANCE && carte.DELIVRANCE.toString().trim() !== ''
      );
      console.log('📊 Cartes avec DELIVRANCE:', cartesAvecDelivrance.length);
      
      // ✅ FILTRER LES CARTES AVEC IDs VALIDES
      const cartesValides = resultats.filter(carte => {
        const id = carte.ID;
        
        // Vérification type-safe
        if (id === null || id === undefined) {
          console.warn('⚠️ Carte ignorée (ID null/undefined):', { nom: carte.NOM });
          return false;
        }
        
        // Convertir en string pour les comparaisons
        const idString = id.toString();
        const idNumber = Number(id);
        
        const idValide = idString !== '' &&
                        idString !== 'batch' && 
                        idString !== 'null' && 
                        idString !== 'undefined' && 
                        !isNaN(idNumber) && 
                        idNumber > 0;
        
        if (!idValide) {
          console.warn('⚠️ Carte ignorée (ID invalide):', { id: carte.ID, nom: carte.NOM });
        }
        return idValide;
      });
      
      console.log(`📋 Cartes à sauvegarder: ${cartesValides.length}/${resultats.length}`);
      
      if (cartesValides.length === 0) {
        alert('❌ Aucune carte valide à sauvegarder.');
        return;
      }
      
      // ✅ SAUVEGARDER SEULEMENT LES CARTES VALIDES
      await updateCartes(cartesValides, token);
      setHasModifications(false);
      
      // 🚨 FORCER LA SYNCHRONISATION AVEC LE DASHBOARD
      await notifyDashboardRefreshEnhanced();
      
      // ⏰ Attendre un peu pour que tout se synchronise
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`✅ ${cartesValides.length} modification(s) enregistrée(s) avec succès !`);
      
      console.log('💾 Sauvegarde terminée avec succès');
      
    } catch (error: any) {
      console.error("❌ Erreur sauvegarde:", error);
      if (error.message.includes('403') || error.message.includes('401')) {
        alert('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
      } else {
        alert("❌ Erreur lors de l'enregistrement");
      }
    }
  };

  // 📤 GESTION DU CLIC SUR "IMPORTER EXCEL"
  const handleImportClick = () => {
    if (!checkToken()) return;
    
    const hideInstructions = localStorage.getItem('hideImportInstructions');
    
    if (hideInstructions === 'true') {
      fileInputRef.current?.click();
    } else {
      setShowImportModal(true);
    }
  };

  // 📤 IMPORT EXCEL DIRECT (VERSION CORRIGÉE AVEC SYNCHRO)
  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!checkToken()) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('❌ Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return;
    }

    setImportLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3000/api/import-export/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 403 || response.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return;
      }

      const result = await response.json();

      if (response.ok) {
        showImportResult(result.stats);
        
        // 📢 NOTIFIER LE DASHBOARD DU CHANGEMENT
        await notifyDashboardRefreshEnhanced();
        
        handleRecherche(1);
      } else {
        alert(`❌ Erreur lors de l'import: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Erreur import:', error);
      alert('❌ Erreur lors de l\'import');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 📤 IMPORT DEPUIS LE MODAL (VERSION CORRIGÉE AVEC SYNCHRO)
  const handleImportFromModal = async (file: File) => {
    if (!checkToken()) return;
    
    setImportLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3000/api/import-export/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 403 || response.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return;
      }

      const result = await response.json();

      if (response.ok) {
        showImportResult(result.stats);
        
        // 📢 NOTIFIER LE DASHBOARD DU CHANGEMENT
        await notifyDashboardRefreshEnhanced();
        
        handleRecherche(1);
      } else {
        alert(`❌ Erreur lors de l'import: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Erreur import:', error);
      alert('❌ Erreur lors de l\'import');
    } finally {
      setImportLoading(false);
    }
  };

  // 📊 FONCTION POUR AFFICHER LES RÉSULTATS
  const showImportResult = (stats: any) => {
    const { imported, duplicates, errors, totalProcessed } = stats;
    
    let message = '';
    let emoji = '✅';
    
    if (errors === 0 && duplicates === 0) {
      message = `✅ Import réussi !\n\n📥 Lignes ajoutées: ${imported}\n📊 Total traité: ${totalProcessed}`;
    } else if (errors === 0) {
      message = `⚠️ Import réussi avec doublons ignorés\n\n📥 Lignes ajoutées: ${imported}\n🔄 Doublons ignorés: ${duplicates}\n📊 Total traité: ${totalProcessed}`;
      emoji = '⚠️';
    } else {
      message = `❌ Import partiellement réussi\n\n📥 Lignes ajoutées: ${imported}\n🔄 Doublons ignorés: ${duplicates}\n❌ Erreurs: ${errors}\n📊 Total traité: ${totalProcessed}`;
      emoji = '❌';
    }
    
    alert(`${emoji} ${message}`);
  };

  // 📥 EXPORT EXCEL DE TOUTES LES CARTES - CORRIGÉ
  const handleExportAllExcel = async () => {
    if (!checkToken()) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:3000/api/import-export/export`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 403 || response.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `toutes-les-cartes-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('📊 Export de TOUTES les cartes réussi !');
      } else {
        alert('❌ Erreur lors de l\'export Excel');
      }
    } catch (error: any) {
      console.error('Erreur export Excel:', error);
      alert('❌ Erreur lors de l\'export Excel');
    } finally {
      setLoading(false);
    }
  };

  // 📥 EXPORT EXCEL DES RÉSULTATS DE RECHERCHE - CORRIGÉ
  const handleExportResultsExcel = async () => {
    if (!checkToken()) return;
    
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      Object.entries(criteres).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          params.append(key, value.trim());
        }
      });

      const response = await fetch(`http://localhost:3000/api/import-export/export-resultats?${params}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 403 || response.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resultats-recherche-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('📊 Export des résultats de recherche réussi !');
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur export résultats:', errorText);
        alert('❌ Erreur lors de l\'export des résultats');
      }
    } catch (error: any) {
      console.error('Erreur export résultats Excel:', error);
      alert('❌ Erreur lors de l\'export des résultats');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResultats = (nouvellesCartes: Carte[]) => {
    console.log('🔄 Mise à jour des résultats:', nouvellesCartes.length, 'cartes');
    
    // Debug: compter les cartes avec DELIVRANCE
    const cartesAvecDelivrance = nouvellesCartes.filter(carte => 
      carte.DELIVRANCE && carte.DELIVRANCE.toString().trim() !== ''
    );
    console.log('📝 Cartes avec DELIVRANCE:', cartesAvecDelivrance.length);
    
    setResultats(nouvellesCartes);
    setHasModifications(true);
  };

  // 🗑️ RÉINITIALISER LES CRITÈRES
  const handleReset = () => {
    setCriteres({
      nom: "",
      prenom: "",
      contact: "",
      siteRetrait: "",
      lieuNaissance: "",
      dateNaissance: "",
      rangement: ""
    });
    setResultats([]);
    setTotalResultats(0);
    setCurrentPage(1);
    setTotalPages(1);
  };

  // ✅ CHANGEMENT DE PAGE
  const handlePageChange = (newPage: number) => {
    if (hasModifications) {
      const confirmChange = window.confirm(
        "Vous avez des modifications non sauvegardées. Voulez-vous continuer sans sauvegarder ?"
      );
      if (!confirmChange) return;
    }
    handleRecherche(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role={role} />
      
      {/* 🎯 EN-TÊTE PROFESSIONNEL */}
      <div className="bg-white border-b border-gray-200 py-6 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F77F00] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🔍</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Recherche Avancée des Cartes
              </h1>
              <p className="text-gray-600 mt-1">
                COORDINATION ABIDJAN NORD-COCODY • Rôle: {role}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* 🎛️ CARTE DES CRITÈRES DE RECHERCHE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F77F00] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎯</span>
              </div>
              Critères de Recherche
            </h2>
            <div className="w-2 h-2 bg-[#0077B6] rounded-full animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* NOM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#F77F00]">👤</span> Nom
              </label>
              <input
                type="text"
                value={criteres.nom}
                onChange={(e) => setCriteres({...criteres, nom: e.target.value})}
                placeholder="Rechercher par nom..."
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F77F00] focus:border-[#F77F00] transition-all duration-200"
              />
            </div>

            {/* PRÉNOM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#0077B6]">👥</span> Prénom
              </label>
              <input
                type="text"
                value={criteres.prenom}
                onChange={(e) => setCriteres({...criteres, prenom: e.target.value})}
                placeholder="Rechercher par prénom..."
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-[#0077B6] transition-all duration-200"
              />
            </div>

            {/* CONTACT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#2E8B57]">📞</span> Contact
              </label>
              <input
                type="text"
                value={criteres.contact}
                onChange={(e) => setCriteres({...criteres, contact: e.target.value})}
                placeholder="Numéro de téléphone..."
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-[#2E8B57] transition-all duration-200"
              />
            </div>

            {/* SITE DE RETRAIT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#F77F00]">🏢</span> Site de Retrait
              </label>
              <input
                type="text"
                value={criteres.siteRetrait}
                onChange={(e) => setCriteres({...criteres, siteRetrait: e.target.value})}
                placeholder="Nom du site..."
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F77F00] focus:border-[#F77F00] transition-all duration-200"
              />
            </div>

            {/* LIEU DE NAISSANCE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#0077B6]">🗺️</span> Lieu de Naissance
              </label>
              <input
                type="text"
                value={criteres.lieuNaissance}
                onChange={(e) => setCriteres({...criteres, lieuNaissance: e.target.value})}
                placeholder="Ville, région..."
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-[#0077B6] transition-all duration-200"
              />
            </div>

            {/* DATE DE NAISSANCE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#2E8B57]">🎂</span> Date de Naissance
              </label>
              <input
                type="date"
                value={criteres.dateNaissance}
                onChange={(e) => setCriteres({...criteres, dateNaissance: e.target.value})}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-[#2E8B57] transition-all duration-200"
              />
            </div>

            {/* RANGEMENT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#F77F00]">📦</span> Numéro de Rangement
              </label>
              <input
                type="text"
                value={criteres.rangement}
                onChange={(e) => setCriteres({...criteres, rangement: e.target.value})}
                placeholder="N° de rangement..."
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F77F00] focus:border-[#F77F00] transition-all duration-200"
              />
            </div>

            {/* BOUTON RECHERCHE */}
            <div className="flex items-end">
              <motion.button
                onClick={() => handleRecherche(1)}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Recherche...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Lancer la Recherche
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* BOUTONS ACTION */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <span>🗑️</span>
              Réinitialiser
            </motion.button>
            
            <div className="flex flex-wrap gap-3">
              {/* 📤 IMPORT - ADMINISTRATEUR ET SUPERVISEUR SEULEMENT */}
              {(canImportExcel || role === "Administrateur") && (
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportExcel}
                    accept=".xlsx,.xls"
                    className="hidden"
                  />
                  <motion.button
                    onClick={handleImportClick}
                    disabled={importLoading}
                    whileHover={{ scale: importLoading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2.5 bg-[#0077B6] text-white rounded-lg hover:bg-[#0056b3] disabled:opacity-50 font-semibold transition-all duration-200 shadow-sm flex items-center gap-2"
                  >
                    {importLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Import...
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        Importer Excel
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* 📥 EXPORT EXCEL DE TOUTES LES CARTES - ADMINISTRATEUR ET SUPERVISEUR SEULEMENT */}
              {(canExportAll || role === "Administrateur") && (
                <motion.button
                  onClick={handleExportAllExcel}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] disabled:opacity-50 font-semibold transition-all duration-200 shadow-sm flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Export...
                    </>
                  ) : (
                    <>
                      <span>📥</span>
                      Exporter TOUT Excel
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* 📊 RÉSULTATS ET BOUTONS D'EXPORT */}
        {resultats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#F77F00] rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  Résultats de la Recherche
                </h2>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold text-[#0077B6]">
                    {totalResultats.toLocaleString()} carte{totalResultats > 1 ? 's' : ''} trouvée{totalResultats > 1 ? 's' : ''}
                  </p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* BOUTONS D'EXPORT DES RÉSULTATS - ADMINISTRATEUR ET SUPERVISEUR SEULEMENT */}
              {(canExportResults || role === "Administrateur") && (
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={handleExportResultsExcel}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2.5 bg-[#0077B6] text-white rounded-lg hover:bg-[#0056b3] disabled:opacity-50 font-semibold transition-all duration-200 shadow-sm flex items-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Export...
                      </>
                    ) : (
                      <>
                        <span>📥</span>
                        Exporter résultats
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>

            {/* ✅ PAGINATION */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300">
                <motion.button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  whileHover={{ scale: currentPage <= 1 ? 1 : 1.05 }}
                  className="w-8 h-8 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 transition duration-200 flex items-center justify-center font-bold"
                >
                  ←
                </motion.button>
                
                <span className="px-3 py-1 bg-white border border-gray-300 rounded font-semibold text-gray-700 text-sm">
                  Page {currentPage} / {totalPages}
                </span>
                
                <motion.button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  whileHover={{ scale: currentPage >= totalPages ? 1 : 1.05 }}
                  className="w-8 h-8 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 transition duration-200 flex items-center justify-center font-bold"
                >
                  →
                </motion.button>
              </div>
            </div>

            {/* TABLEAU DES RÉSULTATS */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <TableCartesExcel 
                cartes={resultats}
                role={role}
                onUpdateCartes={handleUpdateResultats}
                canEdit={canModifyData || role === "Administrateur"}
              />
            </div>

            {/* BOUTON SAUVEGARDER - ADMINISTRATEUR ET SUPERVISEUR SEULEMENT */}
            {hasModifications && (canModifyData || role === "Administrateur") && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex justify-end"
              >
                <motion.button
                  onClick={handleSaveModifications}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] font-semibold transition-all duration-200 shadow-sm flex items-center gap-2"
                >
                  <span>💾</span>
                  Enregistrer les modifications
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 🎯 MESSAGE AUCUN RÉSULTAT */}
        {resultats.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Aucune carte trouvée
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Utilisez les critères de recherche ci-dessus pour trouver des cartes spécifiques.
            </p>
          </motion.div>
        )}

        {/* 📱 LOADING */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-3 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-gray-900 font-semibold">Recherche en cours...</p>
                <p className="text-gray-500 text-sm mt-1">Veuillez patienter</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ✅ MODAL D'IMPORT */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onFileSelect={handleImportFromModal}
        isImporting={importLoading}
      />
    </div>
  );
};

export default Inventaire;