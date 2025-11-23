// services/AuthService.ts
import api from './api';

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
  success: boolean;
  message: string;
  token: string;
  utilisateur: Utilisateur;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): Utilisateur | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async logoutUser(): Promise<void> {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    delete api.defaults.headers.common['Authorization'];
  }

  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

export const authService = new AuthService();

// Initialisation automatique
if (typeof window !== 'undefined') {
  authService.initializeAuth();
}