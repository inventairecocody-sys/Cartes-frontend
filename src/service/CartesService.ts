import api from './api';
import type { AxiosResponse } from 'axios';

export interface Carte {
  "LIEU D'ENROLEMENT"?: string;
  "SITE DE RETRAIT"?: string;
  RANGEMENT?: string;
  NOM: string;
  PRENOMS: string;
  "DATE DE NAISSANCE"?: string;
  "LIEU NAISSANCE"?: string;
  CONTACT?: string;
  DELIVRANCE?: string;
  "CONTACT DE RETRAIT"?: string;
  "DATE DE DELIVRANCE"?: string;
  ID?: number;
  
  [key: string]: any;
}

export interface StatistiquesGlobales {
  total: number;
  retires: number;
  restants: number;
  pourcentageRetrait?: number;
  derniereMiseAJour?: string;
}

export interface StatistiqueSite {
  site: string;
  total: number;
  retires: number;
  restants: number;
  pourcentageRetrait?: number;
}

export interface RechercheResultat {
  cartes: Carte[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  hasMore?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

// 🔹 SERVICE UNIFIÉ ET OPTIMISÉ POUR LA PRODUCTION
class CartesService {
  private cache = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

  // 🔹 STATISTIQUES OPTIMISÉES
  async getStatistiquesGlobales(): Promise<StatistiquesGlobales> {
    const cacheKey = 'stats_globales';
    
    try {
      // Vérifier le cache
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey).data;
      }

      console.log('📊 Chargement des statistiques globales...');
      
      const response: AxiosResponse<StatistiquesGlobales> = await api.get('/statistiques/globales');
      
      const stats = {
        ...response.data,
        pourcentageRetrait: response.data.total > 0 
          ? Math.round((response.data.retires / response.data.total) * 100) 
          : 0,
        derniereMiseAJour: new Date().toISOString()
      };

      // Mettre en cache
      this.setCache(cacheKey, stats);
      
      console.log('✅ Statistiques globales chargées:', stats);
      return stats;
      
    } catch (error: any) {
      console.error('❌ Erreur dans getStatistiquesGlobales:', error);
      
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        total: 0,
        retires: 0,
        restants: 0,
        pourcentageRetrait: 0,
        derniereMiseAJour: new Date().toISOString()
      };
    }
  }

  async getStatistiquesParSite(): Promise<StatistiqueSite[]> {
    const cacheKey = 'stats_sites';
    
    try {
      // Vérifier le cache
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey).data;
      }

      console.log('🏢 Chargement des statistiques par site...');
      
      const response: AxiosResponse<StatistiqueSite[]> = await api.get('/statistiques/sites');
      
      const sitesAvecPourcentage = response.data.map(site => ({
        ...site,
        pourcentageRetrait: site.total > 0 
          ? Math.round((site.retires / site.total) * 100) 
          : 0
      }));

      // Mettre en cache
      this.setCache(cacheKey, sitesAvecPourcentage);
      
      console.log(`✅ ${sitesAvecPourcentage.length} sites chargés`);
      return sitesAvecPourcentage;
      
    } catch (error: any) {
      console.error('❌ Erreur dans getStatistiquesParSite:', error);
      return [];
    }
  }

  // 🔥 SYNCHRONISATION FORCÉE AVEC RETRY
  async forceRefreshStatistiques(): Promise<void> {
    try {
      console.log("🔄 Forçage du recalcul des statistiques...");
      
      await apiUtils.retryRequest(
        () => api.post('/statistiques/refresh'),
        3, // 3 tentatives
        1000 // délai initial de 1s
      );

      // Nettoyer le cache après refresh
      this.clearCache(['stats_globales', 'stats_sites']);
      
      console.log("✅ Synchronisation des statistiques déclenchée");
    } catch (error: any) {
      console.warn('⚠️ Refresh des statistiques échoué:', error.message);
      throw new Error(`Impossible de rafraîchir les statistiques: ${error.message}`);
    }
  }

  // 🔹 SERVICE UNIFIÉ POUR LE DASHBOARD
  async refreshStatistiques(): Promise<{
    globales: StatistiquesGlobales;
    sites: StatistiqueSite[];
    timestamp: string;
  }> {
    try {
      console.log("📊 Rafraîchissement complet des statistiques...");
      
      const [globales, sites] = await Promise.all([
        this.getStatistiquesGlobales(),
        this.getStatistiquesParSite()
      ]);
      
      const result = {
        globales,
        sites,
        timestamp: new Date().toISOString()
      };
      
      console.log("✅ Statistiques rafraîchies:", {
        total: globales.total,
        retires: globales.retires,
        sites: sites.length,
        timestamp: result.timestamp
      });
      
      return result;
    } catch (error: any) {
      console.error('❌ Erreur lors du rafraîchissement des statistiques:', error);
      throw error;
    }
  }

  // 🔥 MÉTHODE POUR SYNCHRONISATION COMPLÈTE
  async forceRefreshAndGetStats(): Promise<{
    globales: StatistiquesGlobales;
    sites: StatistiqueSite[];
    timestamp: string;
  }> {
    try {
      console.log("🔄 Début de la synchronisation forcée...");
      
      await this.forceRefreshStatistiques();
      
      // Attendre un peu pour que le backend traite les données
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await this.refreshStatistiques();
      
      console.log("✅ Synchronisation forcée terminée");
      return result;
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la synchronisation forcée:', error);
      
      // Fallback: retourner les données même si le refresh a échoué
      console.log("🔄 Fallback: utilisation des données existantes...");
      return await this.refreshStatistiques();
    }
  }

  // 🔹 GESTION DES CARTES
  async getCartes(): Promise<Carte[]> {
    try {
      console.log('🃏 Chargement des cartes...');
      
      const response: AxiosResponse<{ cartes: Carte[] }> = await api.get('/cartes');
      const cartes = response.data.cartes || [];
      
      console.log(`✅ ${cartes.length} cartes chargées`);
      return cartes;
    } catch (error: any) {
      console.error('❌ Erreur dans getCartes:', error);
      throw new Error(`Impossible de charger les cartes: ${error.message}`);
    }
  }

  async getCartesPaginated(page: number = 1, limit: number = 100): Promise<RechercheResultat> {
    try {
      console.log(`📄 Chargement page ${page} (limit: ${limit})...`);
      
      const response: AxiosResponse<RechercheResultat> = await api.get(
        `/cartes?page=${page}&limit=${limit}`
      );
      
      const result = response.data;
      result.hasMore = page < result.totalPages;
      
      console.log(`✅ Page ${page} chargée: ${result.cartes.length} cartes`);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur dans getCartesPaginated:', error);
      throw new Error(`Impossible de charger les cartes paginées: ${error.message}`);
    }
  }

  async rechercherCartes(criteres: {
    nom?: string;
    prenom?: string;
    contact?: string;
    siteRetrait?: string;
    lieuNaissance?: string;
    dateNaissance?: string;
    rangement?: string;
    page?: number;
    limit?: number;
  }): Promise<RechercheResultat> {
    try {
      console.log('🔍 Recherche de cartes avec critères:', criteres);
      
      const params = new URLSearchParams();
      
      Object.entries(criteres).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response: AxiosResponse<RechercheResultat> = await api.get(
        `/inventaire/recherche?${params}`
      );

      const result = response.data;
      result.hasMore = (criteres.page || 1) < result.totalPages;
      
      console.log(`✅ Recherche terminée: ${result.cartes.length} résultats`);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur dans rechercherCartes:', error);
      throw new Error(`Recherche échouée: ${error.message}`);
    }
  }

  async createCarte(carte: Carte): Promise<number> {
    try {
      console.log('➕ Création d\'une nouvelle carte...');
      
      const response: AxiosResponse<{ id: number }> = await api.post('/cartes', carte);
      const newId = response.data.id;
      
      // Nettoyer le cache après modification
      this.clearCache(['stats_globales', 'stats_sites']);
      
      console.log(`✅ Carte créée avec ID: ${newId}`);
      return newId;
    } catch (error: any) {
      console.error('❌ Erreur dans createCarte:', error);
      throw new Error(`Impossible de créer la carte: ${error.message}`);
    }
  }

  async updateCartes(cartes: Carte[]): Promise<void> {
    try {
      console.log(`✏️ Mise à jour de ${cartes.length} carte(s)...`);
      
      const role = localStorage.getItem("role") || "";
      
      await api.put('/cartes/batch', { cartes, role });
      
      // Nettoyer le cache après modification
      this.clearCache(['stats_globales', 'stats_sites']);
      
      console.log(`✅ ${cartes.length} carte(s) mises à jour`);
    } catch (error: any) {
      console.error('❌ Erreur dans updateCartes:', error);
      throw new Error(`Impossible de mettre à jour les cartes: ${error.message}`);
    }
  }

  async deleteCarte(id: number): Promise<void> {
    try {
      console.log(`🗑️ Suppression de la carte ${id}...`);
      
      await api.delete(`/cartes/${id}`);
      
      // Nettoyer le cache après modification
      this.clearCache(['stats_globales', 'stats_sites']);
      
      console.log(`✅ Carte ${id} supprimée`);
    } catch (error: any) {
      console.error('❌ Erreur dans deleteCarte:', error);
      throw new Error(`Impossible de supprimer la carte: ${error.message}`);
    }
  }

  // 🔹 GESTION DU CACHE
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
    return !isExpired;
  }

  private clearCache(keys: string[]): void {
    keys.forEach(key => this.cache.delete(key));
    console.log('🧹 Cache nettoyé:', keys);
  }

  // 🔹 MÉTHODE POUR NETTOYER TOUT LE CACHE
  clearAllCache(): void {
    this.cache.clear();
    console.log('🧹 Tout le cache a été nettoyé');
  }
}

// Instance du service
export const cartesService = new CartesService();

// 🔹 FONCTIONS DE COMPATIBILITÉ (pour l'existant)
export const getStatistiquesGlobales = () => cartesService.getStatistiquesGlobales();
export const getStatistiquesParSite = () => cartesService.getStatistiquesParSite();
export const forceRefreshStatistiques = () => cartesService.forceRefreshStatistiques();

// Export des utilitaires d'API depuis le fichier api
import { apiUtils } from './api';
export { apiUtils };