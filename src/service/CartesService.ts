const API_URL = 'http://localhost:3000/api';

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
    const response = await fetch(`${API_URL}/statistiques/globales`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error('Endpoint statistiques/globales non disponible');
  } catch (error) {
    console.error('Erreur dans getStatistiquesGlobales:', error);
    return {
      total: 0,
      retires: 0,
      restants: 0
    };
  }
};

export const getStatistiquesParSite = async (token: string): Promise<StatistiqueSite[]> => {
  try {
    const response = await fetch(`${API_URL}/statistiques/sites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error('Endpoint statistiques/sites non disponible');
  } catch (error) {
    console.error('Erreur dans getStatistiquesParSite:', error);
    return [];
  }
};

// 🔥 FONCTION POUR FORCER LE REFRESH
export const forceRefreshStatistiques = async (token: string): Promise<void> => {
  try {
    console.log("🔄 Forçage du recalcul des statistiques...");
    
    const response = await fetch(`${API_URL}/statistiques/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    console.log("✅ Synchronisation des statistiques déclenchée");
  } catch (error) {
    console.warn('⚠️ Refresh des statistiques échoué, continuation normale...', error);
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
    
    const response = await fetch(`${API_URL}/cartes/batch`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartes, role }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    await response.json();
  } catch (error) {
    console.error('Erreur dans updateCartes:', error);
    throw error;
  }
};

// 🔹 FONCTIONS EXISTANTES (inchangées)
export const getCartes = async (token: string): Promise<Carte[]> => {
  try {
    const response = await fetch(`${API_URL}/cartes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.cartes || [];
  } catch (error) {
    console.error('Erreur dans getCartes:', error);
    throw error;
  }
};

export const getCartesPaginated = async (token: string, page: number = 1, limit: number = 100): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/cartes?page=${page}&limit=${limit}`, {
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
    console.error('Erreur dans getCartesPaginated:', error);
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

    const response = await fetch(`${API_URL}/inventaire/recherche?${params}`, {
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
    console.error('Erreur dans rechercherCartes:', error);
    throw error;
  }
};

export const createCarte = async (carte: Carte, token: string): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/cartes`, {
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
    console.error('Erreur dans createCarte:', error);
    throw error;
  }
};

export const deleteCarte = async (id: number, token: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/cartes/${id}`, {
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
    console.error('Erreur dans deleteCarte:', error);
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
    const response = await fetch(`${API_URL}/cartes/statistiques/total`, {
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
    console.error('Erreur dans getStatistiques:', error);
    throw error;
  }
};