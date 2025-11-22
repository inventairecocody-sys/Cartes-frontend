import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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

// Intercepteur de réponse
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

    if (error.response?.status === 404) {
      console.warn('⚠️ Route API non trouvée:', error.config.url);
      return Promise.resolve({ data: null });
    }

    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.error('🌐 Erreur réseau - Vérifiez la connexion internet');
      return Promise.reject(new Error('Problème de connexion réseau'));
    }

    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Timeout de la requête API');
      return Promise.reject(new Error('La requête a pris trop de temps'));
    }

    return Promise.reject(error);
  }
);

export default api;