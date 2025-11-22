// ===== services/utilisateursService.ts =====
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Fonction pour se connecter
export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // On lit la réponse JSON pour récupérer le message d'erreur du backend
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la connexion");
    }

    const result: LoginResponse = await response.json();
    return result;
  } catch (error: any) {
    // Propagation de l'erreur vers le frontend
    throw error;
  }
};