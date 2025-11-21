import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// Définition du type pour le contexte
interface AuthContextType {
  token: string | null;
  role: string | null;
  user: any | null; // Tu peux remplacer 'any' par un type User plus précis
  setAuth: (token: string, role: string, userData?: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Création du contexte avec des valeurs par défaut
export const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  user: null,
  setAuth: () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Props du provider
type AuthProviderProps = { children: ReactNode };

// Provider complet
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [user, setUser] = useState<any | null>(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  // Fonction pour authentifier l'utilisateur
  const setAuth = (token: string, role: string, userData?: any) => {
    setToken(token);
    setRole(role);
    setUser(userData || { role });

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  // Fonction pour déconnecter l'utilisateur
  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  };

  const isAuthenticated = !!token;

  // Vérification au chargement (ex. token expiré)
  useEffect(() => {
    const checkTokenValidity = () => {
      if (token) {
        console.log("✅ Utilisateur authentifié :", { role, user });
      }
    };

    checkTokenValidity();
  }, [token, role, user]);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        setAuth,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};