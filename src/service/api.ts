import axios from 'axios';

// ✅ VOTRE URL NGROK
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://overnarrowly-incomparable-antoine.ngrok-free.dev';

console.log('🎯 Configuration API Ngrok:', {
  baseURL: API_BASE_URL,
  mode: import.meta.env.MODE
});

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // Timeout augmenté pour Ngrok
});

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 Requête API: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête API:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse optimisé Ngrok
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse API: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erreur réponse API:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });

    // Gestion spécifique Ngrok
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.error('🌐 Erreur réseau Ngrok - Vérifiez que le backend est démarré sur localhost:3000');
      return Promise.reject(new Error('Impossible de joindre le serveur. Vérifiez que le backend est démarré.'));
    }

    if (error.response?.status === 404) {
      console.warn('⚠️ Route API non trouvée:', error.config.url);
      return Promise.resolve({ data: null });
    }

    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Timeout Ngrok - La requête a pris trop de temps');
      return Promise.reject(new Error('Timeout - Le serveur met trop de temps à répondre'));
    }

    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      console.error('🔐 Session expirée');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;