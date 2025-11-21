import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home"; // ✅ Nouvelle page d'accueil
import Dashboard from "./pages/Dashboard";
import Inventaire from "./pages/Inventaire";
import ImportExport from "./pages/ImportExport";
import Journal from "./pages/Journal";
import Profil from "./pages/Profil";

// ✅ Composant pour protéger les routes selon le rôle
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "";

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="p-6 text-center text-red-600">
        Accès refusé : vous n'avez pas les droits pour accéder à cette page.
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Page de connexion */}
        <Route path="/" element={<Login />} />

        {/* ✅ NOUVELLE PAGE D'ACCUEIL - accessible à tous les connectés */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Dashboard accessible à tous les connectés */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Inventaire accessible à tous */}
        <Route
          path="/inventaire"
          element={
            <ProtectedRoute>
              <Inventaire />
            </ProtectedRoute>
          }
        />

        {/* Import/Export : pas pour Opérateurs */}
        <Route
          path="/import-export"
          element={
            <ProtectedRoute allowedRoles={["Administrateur", "Superviseur", "Chef d'équipe"]}>
              <ImportExport />
            </ProtectedRoute>
          }
        />

        {/* Journal : seulement Administrateur */}
        <Route
          path="/journal"
          element={
            <ProtectedRoute allowedRoles={["Administrateur"]}>
              <Journal />
            </ProtectedRoute>
          }
        />

        {/* Profil : accessible à tous */}
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />

        {/* ✅ Redirection par défaut vers home si connecté, sinon vers login */}
        <Route 
          path="*" 
          element={
            localStorage.getItem("token") ? 
            <Navigate to="/home" replace /> : 
            <Navigate to="/" replace />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;