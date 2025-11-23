import api from './api';
import type { AxiosResponse } from 'axios';

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
  permissions?: string[];
  dernierConnexion?: string;
  estActif?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  utilisateur: Utilisateur;
  expiresIn?: number;
  timestamp?: string;
}

export interface RegisterData {
  NomComplet: string;
  NomUtilisateur: string;
  Email: string;
  MotDePasse: string;
  Agence: string;
  Role: "Administrateur" | "Superviseur" | "Chef" | "Operateur";
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  utilisateur?: Utilisateur;
  timestamp?: string;
}

export interface ProfileUpdateData {
  NomComplet?: string;
  Email?: string;
  Agence?: string;
  MotDePasse?: string;
  currentPassword?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: Utilisateur | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// 🔹 SERVICE D'AUTHENTIFICATION OPTIMISÉ POUR LA PRODUCTION
class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private refreshTimeout: NodeJS.Timeout | null = null;

  // 🔹 CONNEXION UTILISATEUR
  async loginUser(data: LoginData): Promise<LoginResponse> {
    try {
      console.log('🔐 Tentative de connexion...', { 
        utilisateur: data.NomUtilisateur,
        agence: 'non spécifiée' // L'agence vient du backend après auth
      });

      const response: AxiosResponse<LoginResponse> = await api.post('/auth/login', data);

      if (response.data.success && response.data.token) {
        // Sauvegarder le token et les données utilisateur
        this.setAuthData(response.data.token, response.data.utilisateur);
        
        // Programmer le refresh du token si expiration fournie
        if (response.data.expiresIn) {
          this.scheduleTokenRefresh(response.data.expiresIn);
        }

        console.log('✅ Connexion réussie:', {
          utilisateur: response.data.utilisateur.NomComplet,
          role: response.data.utilisateur.Role,
          agence: response.data.utilisateur.Agence
        });

        // Émettre un event pour notifier les autres composants
        window.dispatchEvent(new CustomEvent('auth:login', {
          detail: { user: response.data.utilisateur }
        }));
      }

      return response.data;

    } catch (error: any) {
      console.error('❌ Erreur de connexion:', {
        utilisateur: data.NomUtilisateur,
        erreur: error.message
      });

      // Gestion spécifique des erreurs d'authentification
      if (error.response?.status === 401) {
        throw new Error('Identifiants incorrects. Veuillez vérifier votre nom d\'utilisateur et mot de passe.');
      } else if (error.response?.status === 403) {
        throw new Error('Compte désactivé. Veuillez contacter l\'administrateur.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      }

      throw new Error(error.response?.data?.message || error.message || 'Erreur de connexion');
    }
  }

  // 🔹 INSCRIPTION UTILISATEUR (admin seulement)
  async registerUser(data: RegisterData, token: string): Promise<RegisterResponse> {
    try {
      console.log('👤 Création d\'un nouvel utilisateur...', {
        utilisateur: data.NomUtilisateur,
        role: data.Role,
        agence: data.Agence
      });

      const response: AxiosResponse<RegisterResponse> = await api.post('/auth/register', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log('✅ Utilisateur créé avec succès:', {
          nom: data.NomComplet,
          role: data.Role
        });
      }

      return response.data;

    } catch (error: any) {
      console.error('❌ Erreur lors de la création d\'utilisateur:', error);

      if (error.response?.status === 409) {
        throw new Error('Un utilisateur avec ce nom d\'utilisateur ou email existe déjà.');
      } else if (error.response?.status === 403) {
        throw new Error('Vous n\'avez pas les permissions pour créer un utilisateur.');
      }

      throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la création');
    }
  }

  // 🔹 DÉCONNEXION
  async logoutUser(): Promise<void> {
    try {
      const token = this.getToken();
      
      if (token) {
        // Appeler l'API de déconnexion si le token existe
        await api.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la déconnexion API (peut être normal):', error);
    } finally {
      // Nettoyer toujours les données locales
      this.clearAuthData();
      
      console.log('🚪 Utilisateur déconnecté');
      
      // Émettre un event pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  // 🔹 RÉCUPÉRATION DU PROFIL UTILISATEUR
  async getCurrentUser(): Promise<Utilisateur | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      console.log('👤 Récupération du profil utilisateur...');

      const response: AxiosResponse<{ utilisateur: Utilisateur }> = await api.get('/auth/me');
      
      // Mettre à jour les données utilisateur en local
      if (response.data.utilisateur) {
        localStorage.setItem(this.userKey, JSON.stringify(response.data.utilisateur));
      }

      console.log('✅ Profil utilisateur récupéré:', {
        nom: response.data.utilisateur.NomComplet,
        role: response.data.utilisateur.Role
      });

      return response.data.utilisateur;

    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération du profil:', error);
      
      // En cas d'erreur 401, déconnecter l'utilisateur
      if (error.response?.status === 401) {
        this.clearAuthData();
      }
      
      return null;
    }
  }

  // 🔹 MISE À JOUR DU PROFIL
  async updateProfile(data: ProfileUpdateData): Promise<{ success: boolean; message: string }> {
    try {
      console.log('✏️ Mise à jour du profil utilisateur...');

      const response: AxiosResponse<{ success: boolean; message: string }> = await api.put('/profil', data);

      if (response.data.success) {
        // Recharger les données utilisateur
        await this.getCurrentUser();
        
        console.log('✅ Profil mis à jour avec succès');
      }

      return response.data;

    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error);
      throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la mise à jour');
    }
  }

  // 🔹 GESTION DES DONNÉES D'AUTHENTIFICATION LOCALES
  private setAuthData(token: string, user: Utilisateur): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    
    // Configurer axios pour utiliser le token
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    
    // Supprimer le header Authorization
    delete api.defaults.headers.common['Authorization'];
    
    // Annuler le refresh du token
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  // 🔹 RÉCUPÉRATION DES DONNÉES D'AUTHENTIFICATION
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

  // 🔹 RÉINITIALISATION AUTOMATIQUE DE L'AUTHENTIFICATION
  initializeAuth(): void {
    const token = this.getToken();
    const user = this.getUser();

    if (token && user) {
      // Restaurer l'authentification
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('🔄 Authentification restaurée:', {
        utilisateur: user.NomComplet,
        role: user.Role
      });

      // Vérifier la validité du token
      this.validateToken();
    }
  }

  // 🔹 VALIDATION DU TOKEN
  private async validateToken(): Promise<boolean> {
    try {
      await api.get('/auth/me');
      return true;
    } catch (error) {
      console.warn('⚠️ Token invalide, déconnexion...');
      this.clearAuthData();
      return false;
    }
  }

  // 🔹 PROGRAMMATION DU REFRESH DU TOKEN
  private scheduleTokenRefresh(expiresIn: number): void {
    // Rafraîchir le token 5 minutes avant expiration
    const refreshTime = (expiresIn - 300) * 1000;
    
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    this.refreshTimeout = setTimeout(async () => {
      try {
        console.log('🔄 Refresh automatique du token...');
        await this.refreshToken();
      } catch (error) {
        console.error('❌ Échec du refresh du token:', error);
        this.clearAuthData();
      }
    }, refreshTime);
  }

  // 🔹 REFRESH DU TOKEN
  private async refreshToken(): Promise<void> {
    try {
      const response: AxiosResponse<{ token: string; expiresIn: number }> = await api.post('/auth/refresh');
      
      if (response.data.token) {
        const currentUser = this.getUser();
        this.setAuthData(response.data.token, currentUser!);
        this.scheduleTokenRefresh(response.data.expiresIn);
        
        console.log('✅ Token rafraîchi avec succès');
      }
    } catch (error) {
      throw new Error('Impossible de rafraîchir le token');
    }
  }

  // 🔹 VÉRIFICATION DES PERMISSIONS
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    if (!user) return false;

    // Logique de permissions basée sur le rôle
    const permissionsParRole: { [key: string]: string[] } = {
      Administrateur: ['*'],
      Superviseur: ['read', 'write', 'export', 'manage_users'],
      Chef: ['read', 'write', 'export'],
      Operateur: ['read', 'write']
    };

    const permissions = permissionsParRole[user.Role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }

  // 🔹 RÉINITIALISATION DU MOT DE PASSE
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔐 Demande de réinitialisation de mot de passe...', { email });

      const response: AxiosResponse<{ success: boolean; message: string }> = await api.post('/auth/reset-password', { email });

      console.log('✅ Demande de réinitialisation envoyée');
      return response.data;

    } catch (error: any) {
      console.error('❌ Erreur lors de la réinitialisation:', error);
      throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la réinitialisation');
    }
  }
}

// Instance du service
export const authService = new AuthService();

// 🔹 FONCTION DE COMPATIBILITÉ (pour l'existant)
export const loginUser = (data: LoginData) => authService.loginUser(data);

// Initialisation automatique au chargement
if (typeof window !== 'undefined') {
  authService.initializeAuth();
}