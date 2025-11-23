import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Configuration dynamique selon l'environnement
const getBaseURL = (): string => {
  // En production, utilise l'URL de l'API depuis les variables d'environnement
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://overnarrowly-incomparable-antoine.ngrok-free.dev';
  }
  // En développement, utilise localhost ou l'URL définie
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

// Configuration principale d'axios
const api = axios.create({
  baseURL: `${getBaseURL()}/api`,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000, // 30 secondes de timeout pour les appels longs
  withCredentials: true, // Important pour les cookies d'authentification
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ajout du token d'authentification si disponible
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ajout d'un header pour identifier la source (utile pour le backend)
    config.headers['X-Client-Source'] = 'netlify-frontend';
    config.headers['X-Client-Version'] = import.meta.env.VITE_APP_VERSION || '1.0.0';

    // Log en mode développement
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        headers: config.headers
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log en mode développement
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
        data: response.data,
        headers: response.headers
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // Gestion centralisée des erreurs
    const errorMessage = getErrorMessage(error);

    // Log détaillé de l'erreur
    console.error('❌ API Response Error:', {
      message: errorMessage,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });

    // Gestion spécifique des erreurs HTTP
    if (error.response?.status === 401) {
      // Token expiré ou non valide
      handleUnauthorizedError();
    } else if (error.response?.status === 403) {
      // Accès refusé
      handleForbiddenError();
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      // Problème de réseau (ngrok peut être instable)
      handleNetworkError();
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      handleTimeoutError();
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      code: error.code,
      data: error.response?.data,
      originalError: error
    });
  }
);

// Fonctions de gestion d'erreurs
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
    return (error.response.data as any).message;
  }

  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return 'Problème de connexion réseau. Vérifiez votre connexion internet.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'La requête a pris trop de temps. Veuillez réessayer.';
  }

  switch (error.response?.status) {
    case 401:
      return 'Session expirée. Veuillez vous reconnecter.';
    case 403:
      return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    case 404:
      return 'Ressource non trouvée.';
    case 500:
      return 'Erreur interne du serveur. Veuillez réessayer plus tard.';
    case 502:
      return 'Serveur temporairement indisponible. Veuillez réessayer.';
    case 503:
      return 'Service temporairement indisponible. Maintenance en cours.';
    default:
      return 'Une erreur est survenue. Veuillez réessayer.';
  }
}

function handleUnauthorizedError(): void {
  // Suppression du token expiré
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  
  // Redirection vers la page de login si on est pas déjà dessus
  if (!window.location.pathname.includes('/login')) {
    // Utilisation d'un event personnalisé pour éviter les imports circulaires
    window.dispatchEvent(new CustomEvent('auth:logout', {
      detail: { reason: 'session_expired' }
    }));
  }
}

function handleForbiddenError(): void {
  // Log supplémentaire pour les erreurs 403
  console.warn('⚠️ Accès refusé - Permissions insuffisantes');
}

function handleNetworkError(): void {
  // Gestion spécifique des erreurs réseau (ngrok instable)
  console.warn('🌐 Problème de connexion - Le service backend peut être temporairement indisponible');
  
  // Émission d'un event pour notifier les composants
  window.dispatchEvent(new CustomEvent('network:error', {
    detail: { 
      message: 'Problème de connexion au serveur',
      timestamp: new Date().toISOString()
    }
  }));
}

function handleTimeoutError(): void {
  console.warn('⏰ Timeout - La requête a pris trop de temps');
}

// Types pour les utilitaires
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

type RequestFunction<T = any> = () => Promise<T>;

// Fonctions utilitaires pour l'API
export const apiUtils = {
  // Test de connexion à l'API
  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await api.get('/health');
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Test de la base de données
  async testDatabase(): Promise<ApiResponse> {
    try {
      const response = await api.get('/test-db');
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Récupération des statistiques de l'API
  async getApiStats(): Promise<ApiResponse> {
    try {
      const response = await api.get('/');
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Retry mechanism pour les requêtes importantes
  async retryRequest<T>(
    requestFn: RequestFunction<T>, 
    maxRetries: number = 3, 
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn();
        return result;
      } catch (error: any) {
        lastError = error;
        
        if (attempt < maxRetries) {
          console.log(`🔄 Tentative ${attempt}/${maxRetries} échouée, nouvelle tentative dans ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          // Augmentation progressive du délai (backoff exponentiel)
          delay *= 2;
        }
      }
    }
    
    throw lastError;
  }
};

// Export par défaut
export default api;