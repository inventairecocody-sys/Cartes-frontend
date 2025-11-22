// ✅ VOTRE URL NGROK CORRIGÉE
const API_URL = import.meta.env.VITE_API_URL || 'https://overnarrowly-incomparable-antoine.ngrok-free.dev';

console.log('🎯 Service Cartes - URL Ngrok:', API_URL);

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
}

export interface StatistiqueSite {
  site: string;
  total: number;
  retires: number;
  restants: number;
}

// 🔹 FONCTIONS OPTIMISÉES POUR LE DASHBOARD
export const getStatistiquesGlobales = async (token: string): Promise<StatistiquesGlobales> => {
  try {
    const url = `${API_URL}/api/statistiques/globales`;
    console.log('🔗 URL Statistiques Globales:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur statistiques globales:', {
        status: response.status,
        error: errorText
      });
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Statistiques globales reçues:', data);
    return data;

  } catch (error) {
    console.error('❌ Erreur dans getStatistiquesGlobales:', error);
    return {
      total: 0,
      retires: 0,
      restants: 0
    };
  }
};

export const getStatistiquesParSite = async (token: string): Promise<StatistiqueSite[]> => {
  try {
    const url = `${API_URL}/api/statistiques/sites`;
    console.log('🔗 URL Statistiques Sites:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur statistiques sites:', {
        status: response.status,
        error: errorText
      });
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ ${data.length} sites reçus`);
    return data;

  } catch (error) {
    console.error('❌ Erreur dans getStatistiquesParSite:', error);
    return [];
  }
};

// 🔥 FONCTION POUR FORCER LE REFRESH
export const forceRefreshStatistiques = async (token: string): Promise<void> => {
  try {
    console.log("🔄 Forçage du recalcul des statistiques...");
    const url = `${API_URL}/api/statistiques/refresh`;
    console.log('🔗 URL Refresh Stats:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Refresh failed: ${response.status} - ${errorText}`);
    }

    console.log("✅ Synchronisation des statistiques déclenchée");

  } catch (error) {
    console.warn('⚠️ Refresh des statistiques échoué:', error);
    throw error;
  }
};

// 🔹 SERVICE UNIFIÉ POUR LE DASHBOARD
class CartesService {
  async refreshStatistiques(token: string): Promise<{
    globales: StatistiquesGlobales;
    sites: StatistiqueSite[];
  }> {
    try {
      console.log("📊 Rafraîchissement des statistiques...");
      
      const [globales, sites] = await Promise.all([
        getStatistiquesGlobales(token),
        getStatistiquesParSite(token)
      ]);
      
      console.log("✅ Statistiques rafraîchies:", {
        total: globales.total,
        retires: globales.retires,
        sites: sites.length
      });
      
      return { globales, sites };
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement des statistiques:', error);
      throw error;
    }
  }

  // 🔥 MÉTHODE POUR SYNCHRONISATION COMPLÈTE
  async forceRefreshAndGetStats(token: string): Promise<{
    globales: StatistiquesGlobales;
    sites: StatistiqueSite[];
  }> {
    try {
      console.log("🔄 Début de la synchronisation forcée...");
      
      await forceRefreshStatistiques(token);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await this.refreshStatistiques(token);
      
      console.log("✅ Synchronisation forcée terminée");
      return result;
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation forcée:', error);
      return await this.refreshStatistiques(token);
    }
  }
}

export const cartesService = new CartesService();

// 🔹 FONCTION UPDATE CARTES CORRIGÉE
export const updateCartes = async (cartes: Carte[], token: string): Promise<void> => {
  try {
    // ✅ VÉRIFICATION DU TOKEN
    if (!token) {
      throw new Error('Token manquant');
    }

    const role = localStorage.getItem("role") || "";
    
    const url = `${API_URL}/api/cartes/batch`;
    console.log('🔗 URL Update Cartes:', url);
    console.log('📤 Cartes à mettre à jour:', cartes.length);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartes, role }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur update cartes:', {
        status: response.status,
        error: errorText
      });
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Cartes mises à jour:', result);

  } catch (error) {
    console.error('❌ Erreur dans updateCartes:', error);
    throw error;
  }
};

// 🔹 FONCTIONS EXISTANTES (CORRIGÉES)
export const getCartes = async (token: string): Promise<Carte[]> => {
  try {
    const url = `${API_URL}/api/cartes`;
    console.log('🔗 URL Get Cartes:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.cartes || [];
  } catch (error) {
    console.error('❌ Erreur dans getCartes:', error);
    throw error;
  }
};

export const getCartesPaginated = async (token: string, page: number = 1, limit: number = 100): Promise<any> => {
  try {
    const url = `${API_URL}/api/cartes?page=${page}&limit=${limit}`;
    console.log('🔗 URL Get Cartes Paginated:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erreur dans getCartesPaginated:', error);
    throw error;
  }
};

export const rechercherCartes = async (
  token: string, 
  criteres: {
    nom?: string;
    prenom?: string;
    contact?: string;
    siteRetrait?: string;
    lieuNaissance?: string;
    dateNaissance?: string;
    rangement?: string;
    page?: number;
    limit?: number;
  }
): Promise<{
  cartes: Carte[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}> => {
  try {
    const params = new URLSearchParams();
    
    if (criteres.nom) params.append('nom', criteres.nom);
    if (criteres.prenom) params.append('prenom', criteres.prenom);
    if (criteres.contact) params.append('contact', criteres.contact);
    if (criteres.siteRetrait) params.append('siteRetrait', criteres.siteRetrait);
    if (criteres.lieuNaissance) params.append('lieuNaissance', criteres.lieuNaissance);
    if (criteres.dateNaissance) params.append('dateNaissance', criteres.dateNaissance);
    if (criteres.rangement) params.append('rangement', criteres.rangement);
    if (criteres.page) params.append('page', criteres.page.toString());
    if (criteres.limit) params.append('limit', criteres.limit.toString());

    const url = `${API_URL}/api/inventaire/recherche?${params}`;
    console.log('🔗 URL Recherche Cartes:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur recherche cartes:', {
        status: response.status,
        url: response.url,
        error: errorText
      });
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    // ✅ Vérification que c'est bien du JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Réponse non-JSON recherche:', text.substring(0, 200));
      throw new Error(`Réponse non-JSON: ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    console.log('✅ Résultats recherche:', {
      cartes: data.cartes?.length || 0,
      total: data.total,
      page: data.page
    });

    return data;

  } catch (error) {
    console.error('❌ Erreur dans rechercherCartes:', error);
    throw error;
  }
};

export const createCarte = async (carte: Carte, token: string): Promise<number> => {
  try {
    const url = `${API_URL}/api/cartes`;
    console.log('🔗 URL Create Carte:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carte),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('❌ Erreur dans createCarte:', error);
    throw error;
  }
};

export const deleteCarte = async (id: number, token: string): Promise<void> => {
  try {
    const url = `${API_URL}/api/cartes/${id}`;
    console.log('🔗 URL Delete Carte:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    await response.json();
  } catch (error) {
    console.error('❌ Erreur dans deleteCarte:', error);
    throw error;
  }
};

export const getStatistiques = async (token: string): Promise<{
  total: number;
  retires: number;
  disponibles: number;
  parSite: { [site: string]: number };
}> => {
  try {
    const url = `${API_URL}/api/cartes/statistiques/total`;
    console.log('🔗 URL Get Statistiques:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erreur dans getStatistiques:', error);
    throw error;
  }
};