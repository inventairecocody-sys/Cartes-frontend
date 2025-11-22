// ✅ VOTRE URL NGROK CORRIGÉE
const API_URL = import.meta.env.VITE_API_URL || 'https://overnarrowly-incomparable-antoine.ngrok-free.dev';

console.log('🎯 Service Utilisateurs - URL Ngrok:', API_URL);

export interface LoginData {
  NomUtilisateur: string;
  MotDePasse: string;
}

export interface Utilisateur {
  id: number;
  NomComplet: string;
  NomUtilisateur: string;
  Email: string;
  Agence: string;
  Role: "Administrateur" | "Superviseur" | "Chef" | "Operateur";
}

export interface LoginResponse {
  message: string;
  token: string;
  utilisateur: Utilisateur;
}

// Fonction pour se connecter
export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const url = `${API_URL}/api/auth/login`;
    console.log('🔗 Connexion à:', url);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la connexion");
    }

    const result: LoginResponse = await response.json();
    console.log('✅ Connexion réussie:', result.utilisateur.NomUtilisateur);
    return result;
  } catch (error: any) {
    console.error('❌ Erreur connexion:', error.message);
    
    // Message d'erreur amélioré
    if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
      throw new Error('🌐 Impossible de joindre le serveur. Vérifiez que le backend est démarré sur localhost:3000 et que Ngrok est actif.');
    }
    
    throw error;
  }
};