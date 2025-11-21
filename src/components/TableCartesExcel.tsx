import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Carte } from "../service/CartesService";

interface TableCartesExcelProps {
  cartes: Carte[];
  role: string;
  onUpdateCartes: (cartes: Carte[]) => void;
  canEdit?: boolean; // ✅ Nouvelle prop pour gérer les permissions
}

const TableCartesExcel: React.FC<TableCartesExcelProps> = ({ 
  cartes, 
  role, 
  onUpdateCartes,
  canEdit = true // ✅ Par défaut true pour maintenir la compatibilité
}) => {
  const [editingCell, setEditingCell] = useState<{rowIndex: number, column: string} | null>(null);
  const [editValue, setEditValue] = useState("");

  // ✅ CONFIGURATION DES PERMISSIONS PAR RÔLE
  const getPermissionsByRole = () => {
    switch (role) {
      case "Administrateur":
        return {
          canEditAll: true,
          canExport: true,
          canImport: true,
          canModify: true
        };
      case "Superviseur":
        return {
          canEditAll: true,
          canExport: true,
          canImport: true,
          canModify: true
        };
      case "Chef d'équipe":
        return {
          canEditAll: false,
          canExport: false,
          canImport: false,
          canModify: false
        };
      case "Operateur":
        return {
          canEditAll: false,
          canExport: false,
          canImport: false,
          canModify: false
        };
      default:
        return {
          canEditAll: false,
          canExport: false,
          canImport: false,
          canModify: false
        };
    }
  };

  const permissions = getPermissionsByRole();

  // ✅ COLONNES AVEC DESIGN HARMONISÉ - CORRECTION TYPESCRIPT
  const colonnes = [
    { key: "NOM", label: "Nom", editable: permissions.canEditAll, width: "w-28" },
    { key: "PRENOMS", label: "Prénoms", editable: permissions.canEditAll, width: "w-28" },
    { key: "CONTACT", label: "Contact", editable: permissions.canEditAll, width: "w-24" },
    { key: "LIEU D'ENROLEMENT", label: "Lieu Enrôlement", editable: permissions.canEditAll, width: "w-32" },
    { key: "SITE DE RETRAIT", label: "Site Retrait", editable: permissions.canEditAll, width: "w-32" },
    { key: "RANGEMENT", label: "Rangement", editable: permissions.canEditAll, width: "w-24" },
    { key: "DATE DE NAISSANCE", label: "Date Naissance", editable: permissions.canEditAll, width: "w-28" },
    { key: "LIEU NAISSANCE", label: "Lieu Naissance", editable: permissions.canEditAll, width: "w-28" },
    { key: "DELIVRANCE", label: "Délivrance", editable: permissions.canModify, width: "w-24" },
    { key: "CONTACT DE RETRAIT", label: "Contact Retrait", editable: permissions.canModify, width: "w-24" },
    { key: "DATE DE DELIVRANCE", label: "Date Retrait", editable: permissions.canModify, width: "w-28" },
    { key: "RETIREE", label: "Retirée", editable: permissions.canModify, type: "checkbox", width: "w-16" },
  ];

  // ✅ FONCTION POUR OBTENIR LA VALEUR D'UNE CELLULE
  const getCellValue = (carte: Carte, columnKey: string): any => {
    switch (columnKey) {
      case "NOM": return carte.NOM || "";
      case "PRENOMS": return carte.PRENOMS || "";
      case "CONTACT": return carte.CONTACT || "";
      case "LIEU D'ENROLEMENT": return carte["LIEU D'ENROLEMENT"] || "";
      case "SITE DE RETRAIT": return carte["SITE DE RETRAIT"] || "";
      case "RANGEMENT": return carte.RANGEMENT || "";
      case "DATE DE NAISSANCE": return carte["DATE DE NAISSANCE"] || "";
      case "LIEU NAISSANCE": return carte["LIEU NAISSANCE"] || "";
      case "DELIVRANCE": return carte.DELIVRANCE || "";
      case "CONTACT DE RETRAIT": return carte["CONTACT DE RETRAIT"] || "";
      case "DATE DE DELIVRANCE": return carte["DATE DE DELIVRANCE"] || "";
      case "RETIREE": 
        return carte.DELIVRANCE && carte.DELIVRANCE.toString().trim() !== '';
      default: return "";
    }
  };

  // ✅ CLIC SUR UNE CELLULE POUR ÉDITION
  const handleCellClick = (rowIndex: number, column: string) => {
    const col = colonnes.find(col => col.key === column);
    // ✅ CORRECTION TYPESCRIPT : Vérification explicite du boolean
    if (col?.editable === true && col.type !== "checkbox" && canEdit) {
      const currentValue = getCellValue(cartes[rowIndex], column);
      setEditValue(currentValue);
      setEditingCell({ rowIndex, column });
    }
  };

  // ✅ MODIFICATION D'UNE CELLULE - CORRIGÉ POUR GARDER L'ID
  const handleCellChange = (value: any, rowIndex: number, column: string) => {
    if (!canEdit) return; // ✅ Bloque les modifications si pas autorisé
    
    console.log('🔍 TableCartesExcel - Modification cellule:', { rowIndex, column, value });
    
    const updatedCartes = [...cartes];
    const carteToUpdate = { 
      ...updatedCartes[rowIndex],  // 🔥 GARDE TOUTES LES PROPRIÉTÉS DONT L'ID
      ID: updatedCartes[rowIndex].ID // 🔥 FORCE LA CONSERVATION DE L'ID
    };
    
    console.log('🔍 TableCartesExcel - Carte avant modification:', {
      id: carteToUpdate.ID,
      nom: carteToUpdate.NOM,
      delivrance: carteToUpdate.DELIVRANCE
    });
    
    switch (column) {
      case "NOM": carteToUpdate.NOM = value; break;
      case "PRENOMS": carteToUpdate.PRENOMS = value; break;
      case "CONTACT": carteToUpdate.CONTACT = value; break;
      case "LIEU D'ENROLEMENT": carteToUpdate["LIEU D'ENROLEMENT"] = value; break;
      case "SITE DE RETRAIT": carteToUpdate["SITE DE RETRAIT"] = value; break;
      case "RANGEMENT": carteToUpdate.RANGEMENT = value; break;
      case "DATE DE NAISSANCE": carteToUpdate["DATE DE NAISSANCE"] = value; break;
      case "LIEU NAISSANCE": carteToUpdate["LIEU NAISSANCE"] = value; break;
      case "DELIVRANCE": carteToUpdate.DELIVRANCE = value; break;
      case "CONTACT DE RETRAIT": carteToUpdate["CONTACT DE RETRAIT"] = value; break;
      case "DATE DE DELIVRANCE": carteToUpdate["DATE DE DELIVRANCE"] = value; break;
      case "RETIREE":
        if (value) {
          carteToUpdate.DELIVRANCE = "Retirée";
        } else {
          carteToUpdate.DELIVRANCE = "";
        }
        break;
    }
    
    updatedCartes[rowIndex] = carteToUpdate;
    
    console.log('🔍 TableCartesExcel - Carte après modification:', {
      id: carteToUpdate.ID,
      nom: carteToUpdate.NOM,
      delivrance: carteToUpdate.DELIVRANCE
    });
    
    console.log('🔍 TableCartesExcel - IDs envoyés à onUpdateCartes:', updatedCartes.map(c => c.ID));
    
    onUpdateCartes(updatedCartes);
  };

  // ✅ SAUVEGARDE DE L'ÉDITION
  const handleSaveEdit = () => {
    if (editingCell && canEdit) {
      handleCellChange(editValue, editingCell.rowIndex, editingCell.column);
      setEditingCell(null);
      setEditValue("");
    }
  };

  // ✅ CHANGEMENT DE CHECKBOX
  const handleCheckboxChange = (rowIndex: number, column: string, checked: boolean) => {
    if (!canEdit) return; // ✅ Bloque les modifications si pas autorisé
    handleCellChange(checked, rowIndex, column);
  };

  // ✅ FORMATAGE DES DATES POUR L'AFFICHAGE
  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  // ✅ VÉRIFICATION DES PERMISSIONS (maintenant basée sur les permissions configurées)
  const canEditCell = (columnKey: string): boolean => {
    const col = colonnes.find(col => col.key === columnKey);
    // ✅ CORRECTION TYPESCRIPT : Vérification explicite du boolean
    return col?.editable === true && canEdit;
  };

  // ✅ AFFICHAGE DES IDs POUR DEBUG (optionnel)
  const showDebugInfo = false; // Mettre à true pour voir les IDs

  // ✅ BADGE DE STATUT DES PERMISSIONS
  const getPermissionBadge = () => {
    if (permissions.canEditAll) {
      return { text: "✏️ Édition complète", color: "bg-green-100 text-green-800" };
    } else if (permissions.canModify) {
      return { text: "🔒 Édition limitée", color: "bg-orange-100 text-orange-800" };
    } else {
      return { text: "👀 Consultation seule", color: "bg-gray-100 text-gray-600" };
    }
  };

  const permissionBadge = getPermissionBadge();

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
      {/* En-tête du tableau */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="text-lg font-bold">Tableau Excel des Cartes</h3>
              <p className="text-white/90 text-sm">
                {cartes.length} carte{cartes.length > 1 ? 's' : ''} • Rôle: {role}
                {showDebugInfo && ` • IDs: ${cartes.map(c => c.ID).join(', ')}`}
              </p>
            </div>
          </div>
          <div className={`text-sm px-3 py-1 rounded-full font-medium ${permissionBadge.color}`}>
            {permissionBadge.text}
          </div>
        </div>
      </div>

      {/* Tableau avec scroll */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* En-têtes des colonnes */}
          <thead>
            <tr className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white">
              {showDebugInfo && (
                <th className="px-4 py-3 text-left text-sm font-semibold border-r border-white/20 w-16">
                  ID
                </th>
              )}
              {colonnes.map((col) => (
                <th 
                  key={col.key}
                  className={`px-4 py-3 text-left text-sm font-semibold border-r border-white/20 ${col.width} ${
                    col.editable !== true ? "opacity-80" : ""
                  }`}
                  title={col.editable !== true ? "Non éditable" : ""}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.editable !== true && (
                      <span className="text-xs opacity-70">🔒</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Corps du tableau */}
          <tbody>
            <AnimatePresence>
              {cartes.map((carte, rowIndex) => (
                <motion.tr 
                  key={carte.ID || rowIndex} // 🔥 Utilise l'ID comme clé si disponible
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: rowIndex * 0.02 }}
                  className={`border-b border-gray-100 transition-all duration-200 ${
                    getCellValue(carte, "RETIREE") 
                      ? "bg-green-50/50 hover:bg-green-100/50" 
                      : "bg-white hover:bg-orange-50/30"
                  } ${!canEdit ? "cursor-default" : ""}`}
                >
                  {/* Colonne ID pour debug */}
                  {showDebugInfo && (
                    <td className="px-4 py-3 text-sm border-r border-gray-100 w-16 text-center bg-gray-50">
                      <span className="text-xs text-gray-500 font-mono">
                        {carte.ID || "N/A"}
                      </span>
                    </td>
                  )}
                  
                  {colonnes.map((col) => {
                    const cellValue = getCellValue(carte, col.key);
                    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.column === col.key;
                    const editable = canEditCell(col.key);
                    
                    return (
                      <motion.td 
                        key={`${carte.ID || rowIndex}-${col.key}`} // 🔥 Utilise l'ID dans la clé
                        whileHover={editable && col.type !== "checkbox" ? { scale: 1.02 } : {}}
                        className={`px-4 py-3 text-sm border-r border-gray-100 ${col.width} ${
                          col.type === "checkbox" ? "text-center" : ""
                        } ${!editable ? "bg-gray-50/30" : ""}`}
                        onClick={() => editable && handleCellClick(rowIndex, col.key)}
                      >
                        {col.type === "checkbox" ? (
                          // ✅ CASE À COCHER STYLISÉE
                          <motion.div 
                            className="flex justify-center"
                            whileHover={editable ? { scale: 1.1 } : {}}
                            whileTap={editable ? { scale: 0.9 } : {}}
                          >
                            <input
                              type="checkbox"
                              checked={cellValue || false}
                              onChange={(e) => handleCheckboxChange(rowIndex, col.key, e.target.checked)}
                              disabled={!editable}
                              className={`h-5 w-5 rounded-lg border-2 focus:ring-2 focus:ring-offset-1 transition-all ${
                                cellValue 
                                  ? "bg-[#2E8B57] border-[#2E8B57] text-white focus:ring-green-200" 
                                  : "bg-white border-gray-300 focus:ring-orange-200"
                              } ${
                                !editable 
                                  ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200" 
                                  : "cursor-pointer"
                              }`}
                            />
                          </motion.div>
                        ) : isEditing ? (
                          // ✅ CHAMP D'ÉDITION STYLISÉ
                          <motion.input
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              else if (e.key === 'Escape') {
                                setEditingCell(null);
                                setEditValue("");
                              }
                            }}
                            className="w-full px-3 py-2 border-2 border-[#F77F00] rounded-xl bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 font-medium"
                            autoFocus
                          />
                        ) : (
                          // ✅ AFFICHAGE NORMAL AVEC STYLES
                          <motion.div 
                            className={`min-h-8 flex items-center truncate rounded-lg px-2 py-1 transition-all duration-200 ${
                              editable ? "cursor-pointer hover:bg-orange-100/50 hover:border hover:border-orange-200" : "cursor-default"
                            } ${
                              !editable ? "text-gray-500 bg-gray-50/50" : "text-gray-800"
                            }`}
                          >
                            {col.key.includes("DATE") ? (
                              <span className={`font-medium ${cellValue ? "text-[#0077B6]" : "text-gray-400"}`}>
                                {formatDate(cellValue)}
                              </span>
                            ) : col.key === "DELIVRANCE" && cellValue ? (
                              <span className="text-[#2E8B57] font-semibold flex items-center gap-1">
                                <span>✓</span>
                                <span>{cellValue}</span>
                              </span>
                            ) : cellValue ? (
                              <span className={editable ? "font-medium" : ""}>{cellValue}</span>
                            ) : (
                              <span className="text-gray-400 italic">-</span>
                            )}
                            {!editable && col.editable === true && (
                              <span className="ml-1 text-xs text-gray-400">🔒</span>
                            )}
                          </motion.div>
                        )}
                      </motion.td>
                    );
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ✅ MESSAGE SI AUCUNE CARTE */}
      {cartes.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 text-center text-gray-500"
        >
          <div className="text-4xl mb-3 text-[#F77F00]">📭</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune carte à afficher</h3>
          <p className="text-sm">Utilisez la recherche pour trouver des cartes spécifiques.</p>
        </motion.div>
      )}

      {/* Pied de tableau informatif */}
      <div className="bg-gray-50/80 border-t border-gray-200 px-6 py-3">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
              Cellules éditables
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#2E8B57] rounded-full"></div>
              Cartes retirées
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              Cellules verrouillées
            </span>
          </div>
          <span>{cartes.length} carte{cartes.length > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default TableCartesExcel;