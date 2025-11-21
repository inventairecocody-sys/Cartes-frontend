import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { cartesService } from "../service/CartesService";
import type { StatistiquesGlobales, StatistiqueSite } from "../service/CartesService";

const Dashboard: React.FC = () => {
  const [statistiquesGlobales, setStatistiquesGlobales] = useState<StatistiquesGlobales>({
    total: 0,
    retires: 0,
    restants: 0
  });
  
  const [statistiquesSites, setStatistiquesSites] = useState<StatistiqueSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const role = localStorage.getItem("role") || "";
  const token = localStorage.getItem("token") || "";

  const CarteStatistique: React.FC<{
    titre: string;
    valeur: number;
    sousTitre: string;
    couleur: 'orange' | 'bleu' | 'vert';
    delai: number;
  }> = ({ titre, valeur, sousTitre, couleur, delai }) => {
    const gradients = {
      orange: 'from-[#F77F00] to-[#FF9E40]',
      bleu: 'from-[#0077B6] to-[#2E8B57]',
      vert: 'from-[#2E8B57] to-[#0077B6]'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delai }}
        className={`relative overflow-hidden backdrop-blur-lg border-2 border-orange-300 rounded-2xl p-6 shadow-xl bg-gradient-to-br ${gradients[couleur]} transition-all duration-300 hover:translate-y-[-2px] hover:shadow-2xl`}
      >
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-white/10 to-white/5 z-1"></div>
        <div className="relative z-2">
          <h3 className="text-white text-lg font-semibold mb-2">{titre}</h3>
          <div className="text-4xl font-bold text-white mb-1">{valeur.toLocaleString()}</div>
          <p className="text-white/90 text-sm font-medium">{sousTitre}</p>
        </div>
      </motion.div>
    );
  };

  const CarteSite: React.FC<{ data: StatistiqueSite; index: number }> = ({ data, index }) => {
    const pourcentage = data.total > 0 ? Math.round((data.retires / data.total) * 100) : 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="bg-white/95 backdrop-blur-lg border-2 border-orange-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-300"
      >
        <h3 className="text-[#F77F00] text-xl font-bold mb-4 truncate border-b-2 border-orange-100 pb-3" title={data.site}>
          {data.site}
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3">
            <span className="text-gray-700 font-medium">Total des cartes</span>
            <span className="text-[#0077B6] font-bold text-lg">{data.total.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center bg-green-50 rounded-lg p-3">
            <span className="text-gray-700 font-medium">Cartes retirées</span>
            <span className="text-[#2E8B57] font-bold text-lg">{data.retires.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center bg-orange-50 rounded-lg p-3">
            <span className="text-gray-700 font-medium">Cartes restantes</span>
            <span className="text-[#F77F00] font-bold text-lg">{data.restants.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progression</span>
            <span className="text-sm font-bold text-[#F77F00]">{pourcentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pourcentage}%` }}
              transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
              className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] h-3 rounded-full shadow-inner"
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const fetchStatistiques = useCallback(async (force: boolean = false) => {
    try {
      setLoading(true);
      setError("");
      
      if (!token) {
        throw new Error('Token non trouvé');
      }

      console.log(force ? '🔄 Chargement FORCÉ des statistiques...' : '🔄 Chargement des statistiques...');
      
      // Utiliser forceRefreshAndGetStats si forcé
      const { globales, sites } = force 
        ? await cartesService.forceRefreshAndGetStats(token)
        : await cartesService.refreshStatistiques(token);
      
      setStatistiquesGlobales(globales);
      setStatistiquesSites(sites);
      setLastUpdate(new Date().toLocaleTimeString('fr-FR'));
      
      // Nettoyer le flag force
      if (force) {
        localStorage.removeItem('forceStatsRefresh');
      }
      
      console.log('✅ Statistiques chargées:', {
        total: globales.total,
        retires: globales.retires,
        sites: sites.length,
        forced: force
      });
      
    } catch (err: any) {
      console.error("❌ Erreur chargement statistiques:", err);
      setError("Erreur lors du chargement des statistiques");
      // Ne pas reset les stats pour garder l'ancienne vue
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 🔄 CHARGEMENT INITIAL
  useEffect(() => {
    fetchStatistiques();
  }, [fetchStatistiques]);

  // 🔄 SYNCHRONISATION AUTOMATIQUE TOUTES LES 5 MINUTES
  useEffect(() => {
    const interval = setInterval(() => fetchStatistiques(), 300000);
    return () => clearInterval(interval);
  }, [fetchStatistiques]);

  // 🔄 ÉCOUTEUR D'ÉVÉNEMENTS AMÉLIORÉ
  useEffect(() => {
    const handleRefreshEvent = (event: any) => {
      const force = event.detail?.force || localStorage.getItem('forceStatsRefresh') === 'true';
      const source = event.detail?.source || 'unknown';
      
      console.log('🔄 Rafraîchissement déclenché', { 
        force, 
        source,
        from: event.detail?.source 
      });
      
      fetchStatistiques(force);
    };

    window.addEventListener('dashboardRefreshNeeded', handleRefreshEvent);
    
    return () => {
      window.removeEventListener('dashboardRefreshNeeded', handleRefreshEvent);
    };
  }, [fetchStatistiques]);

  // 🔄 AJOUTEZ AUSSI CET ÉCOUTEUR POUR BROADCAST CHANNEL
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('dashboard_updates');
      
      channel.onmessage = (event) => {
        if (event.data.type === 'data_updated') {
          console.log('📡 Message BroadcastChannel reçu:', event.data);
          const force = event.data.forceRefresh || false;
          fetchStatistiques(force);
        }
      };
      
      return () => channel.close();
    }
  }, [fetchStatistiques]);

  // 🔄 VÉRIFICATION PÉRIODIQUE DES MODIFICATIONS
  useEffect(() => {
    const checkForUpdates = () => {
      const lastUpdate = localStorage.getItem('lastDataUpdate');
      if (lastUpdate) {
        const updateTime = parseInt(lastUpdate);
        const currentTime = Date.now();
        // Si modification récente (moins de 2 minutes)
        if (currentTime - updateTime < 120000) {
          console.log('🔄 Modification récente détectée, rafraîchissement...');
          fetchStatistiques(true);
        }
      }
    };

    const updateInterval = setInterval(checkForUpdates, 30000); // Vérifier toutes les 30s
    return () => clearInterval(updateInterval);
  }, [fetchStatistiques]);

  const totalCartesSites = statistiquesSites.reduce((sum, site) => sum + site.total, 0);
  const isDataConsistent = totalCartesSites === statistiquesGlobales.total;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navbar role={role} />
      
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 py-4 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tableau de Bord Statistique
                </h1>
                <p className="text-sm text-gray-600">
                  COORDINATION ABIDJAN NORD-COCODY
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">Données en temps réel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 min-h-screen">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            ⚠️ {error}
          </motion.div>
        )}

        {loading ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-xl border-2 border-orange-200 p-8 text-center shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-gray-900 font-bold text-lg">Chargement des statistiques</p>
                <p className="text-sm text-gray-600 mt-1">Calcul en cours...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl border-2 border-orange-200 p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">🌍</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Statistique Globale de la Coordination</h2>
                  <p className="text-sm text-gray-600">
                    Vue d'ensemble de toutes les cartes distribuées
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CarteStatistique
                  titre="Total des Cartes"
                  valeur={statistiquesGlobales.total}
                  sousTitre="Nombre total de cartes distribuées"
                  couleur="orange"
                  delai={0.1}
                />
                
                <CarteStatistique
                  titre="Cartes Retirées"
                  valeur={statistiquesGlobales.retires}
                  sousTitre="Cartes avec délivrance complétée"
                  couleur="bleu"
                  delai={0.2}
                />
                
                <CarteStatistique
                  titre="Cartes Restantes"
                  valeur={statistiquesGlobales.restants}
                  sousTitre="Cartes disponibles au retrait"
                  couleur="vert"
                  delai={0.3}
                />
              </div>

              {isDataConsistent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ✅ Données cohérentes : Total global = Somme des sites
                </motion.div>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl border-2 border-blue-200 p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#2E8B57] rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white text-lg">🏢</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Statistiques Spécifiques par Site de Retrait
                    </h2>
                    <p className="text-sm text-gray-600">
                      Détail des cartes pour chaque site - {statistiquesSites.length} sites actifs
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Dernière mise à jour</div>
                    <div className="text-sm font-bold text-[#F77F00]">{lastUpdate}</div>
                  </div>
                  
                  <button
                    onClick={() => fetchStatistiques(true)}
                    className="px-4 py-2 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] text-white rounded-lg hover:shadow-lg font-medium transition duration-200 flex items-center gap-2 shadow-md"
                  >
                    <span>🔄</span>
                    Actualiser
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {statistiquesSites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {statistiquesSites.map((site, index) => (
                      <CarteSite
                        key={site.site}
                        data={site}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-orange-50/50 backdrop-blur-sm rounded-xl border-2 border-orange-200"
                  >
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <span className="text-3xl">🏢</span>
                    </div>
                    <p className="text-gray-600 text-lg mb-2 font-medium">Aucun site de retrait trouvé</p>
                    <p className="text-gray-500 text-sm">
                      Les données des sites apparaîtront ici une fois disponibles
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="fixed bottom-6 right-6 flex flex-col items-end gap-3"
            >
              <div className="bg-white/90 backdrop-blur-lg border-2 border-green-200 rounded-xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-600">Synchronisation auto</div>
                    <div className="text-sm font-bold text-green-600">Toutes les 5 min</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => fetchStatistiques(true)}
                className="bg-gradient-to-br from-[#F77F00] to-[#FF9E40] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
                title="Rafraîchir maintenant"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;