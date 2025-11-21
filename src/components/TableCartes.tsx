import React, { useState } from "react";
import { motion } from "framer-motion"; // ✅ SUPPRESSION de AnimatePresence inutilisé
import type { Carte } from "../service/CartesService";

interface TableCartesProps {
  cartes: Carte[];
  loading: boolean;
  role: string;
  onUpdateCartes: (cartes: Carte[]) => Promise<void>;
}

const TableCartes: React.FC<TableCartesProps> = ({ cartes, loading, role, onUpdateCartes }) => {
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);

  // Configuration des colonnes avec labels français
  const columnConfig: { [key: string]: { label: string; editable: boolean; width?: string } } = {
    ID: { label: "ID", editable: false, width: "80px" },
    NOM: { label: "Nom", editable: true },
    PRENOMS: { label: "Prénoms", editable: true },
    CONTACT: { label: "Contact", editable: true },
    "DATE DE NAISSANCE": { label: "Date Naissance", editable: true, width: "140px" },
    "LIEU NAISSANCE": { label: "Lieu Naissance", editable: true },
    "SITE DE RETRAIT": { label: "Site Retrait", editable: true },
    RANGEMENT: { label: "Rangement", editable: true },
    DELIVRANCE: { label: "Délivrance", editable: true, width: "120px" },
    "CONTACT DE RETRAIT": { label: "Contact Retrait", editable: true },
    "DATE DE DELIVRANCE": { label: "Date Délivrance", editable: true, width: "140px" },
    "LIEU D'ENROLEMENT": { label: "Lieu Enrôlement", editable: true }
  };

  const handleChange = (id: number, field: string, value: string) => {
    if (role === "Opérateur" && !["DELIVRANCE", "CONTACT DE RETRAIT", "DATE DE DELIVRANCE"].includes(field)) return;
    
    const updated = cartes.map(c => 
      c.ID === id ? { ...c, [field]: value } : c
    );
    onUpdateCartes(updated);
    setEditingCell(null);
  };

  const isEditable = (field: string): boolean => {
    if (role === "Opérateur") {
      return ["DELIVRANCE", "CONTACT DE RETRAIT", "DATE DE DELIVRANCE"].includes(field);
    }
    return true;
  };

  const formatValue = (value: any, field: string): string => {
    if (value === null || value === undefined) return "";
    
    if (field.includes("DATE") && value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('fr-FR');
        }
      } catch {
        return String(value);
      }
    }
    
    return String(value);
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-semibold text-lg">Chargement des cartes...</p>
          <p className="text-gray-500">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (cartes.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-12 text-center">
        <div className="text-4xl mb-4 text-[#F77F00]">📋</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Aucune carte trouvée</h3>
        <p className="text-gray-600">Utilisez la recherche pour trouver des cartes spécifiques.</p>
      </div>
    );
  }

  const columns = Object.keys(columnConfig);

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
      {/* En-tête du tableau */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📊</span>
            <div>
              <h3 className="text-lg font-bold">Tableau des Cartes</h3>
              <p className="text-white/90 text-sm">
                {cartes.length} carte{cartes.length > 1 ? 's' : ''} affichée{cartes.length > 1 ? 's' : ''}
                {role === "Opérateur" && " - Mode consultation limité"}
              </p>
            </div>
          </div>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {role}
          </div>
        </div>
      </div>

      {/* Tableau avec scroll horizontal */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white">
              {columns.map((column) => (
                <th 
                  key={column} 
                  className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap"
                  style={{ width: columnConfig[column]?.width }}
                >
                  {columnConfig[column]?.label || column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cartes.map((carte, index) => (
              <motion.tr 
                key={carte.ID || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-orange-50/50 transition-colors duration-200"
              >
                {columns.map((column) => {
                  const field = column;
                  const value = carte[field as keyof Carte];
                  const editable = isEditable(field) && !loading;
                  const isEditing = editingCell?.id === carte.ID && editingCell?.field === field;

                  return (
                    <td 
                      key={field} 
                      className="px-4 py-3 text-sm whitespace-nowrap"
                    >
                      {!editable ? (
                        <span className="text-gray-700">
                          {formatValue(value, field)}
                        </span>
                      ) : isEditing ? (
                        <input
                          className="w-full px-3 py-2 border-2 border-[#F77F00] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800"
                          value={value || ""}
                          onChange={(e) => handleChange(carte.ID!, field, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleChange(carte.ID!, field, (e.target as HTMLInputElement).value);
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="cursor-pointer px-3 py-2 rounded-lg border border-transparent hover:border-orange-200 hover:bg-orange-50 transition-all duration-200"
                          onClick={() => setEditingCell({ id: carte.ID!, field })}
                        >
                          <span className="text-gray-800">
                            {formatValue(value, field) || (
                              <span className="text-gray-400 italic">vide</span>
                            )}
                          </span>
                        </motion.div>
                      )}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pied de tableau */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            {cartes.length} carte{cartes.length > 1 ? 's' : ''} • 
            {role === "Opérateur" ? " Mode consultation" : " Mode édition complet"}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
              Champs éditables
            </span>
            {role === "Opérateur" && (
              <span className="flex items-center gap-2 text-[#0077B6]">
                <span>🔒</span>
                Accès limité
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableCartes;