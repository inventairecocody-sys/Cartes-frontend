import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";

interface JournalEntry {
    JournalID: number;
    UtilisateurID: number;
    NomUtilisateur: string;
    NomComplet: string;
    Role: string;
    Agence: string;
    DateAction: string;
    Action: string;
    TableAffectee: string;
    LigneAffectee: string;
    IPUtilisateur: string;
    Systeme: string;
    UserName: string;
    RoleUtilisateur: string;
    ActionType: string;
    TableName: string;
    RecordId: string;
    OldValue: string;
    NewValue: string;
    AdresseIP: string;
    UserId: number;
    ImportBatchID?: string;
    DetailsAction: string;
}

interface PaginationInfo {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

interface ImportBatch {
    ImportBatchID: string;
    nombreCartes: number;
    dateImport: string;
    NomUtilisateur: string;
    NomComplet: string;
    Agence: string;
}

// ✅ CONFIGURATION DE L'API - Proxy Vite
const API_BASE_URL = '/api';

const Journal: React.FC = () => {
    const [logs, setLogs] = useState<JournalEntry[]>([]);
    const [imports, setImports] = useState<ImportBatch[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        pageSize: 50,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        dateDebut: '',
        dateFin: '',
        utilisateur: '',
        actionType: '',
        tableName: ''
    });
    const [loading, setLoading] = useState(false);
    const [importsLoading, setImportsLoading] = useState(false);
    const [selectedImport, setSelectedImport] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [showImports, setShowImports] = useState(false);

    const token = localStorage.getItem("token") || "";

    // 🎨 CONFIGURATION DES COULEURS PAR TYPE D'ACTION
    const getActionColor = (actionType: string) => {
        const colors: { [key: string]: string } = {
            'IMPORT_CARTE': 'bg-green-500',
            'CREATION_CARTE': 'bg-green-500',
            'MODIFICATION_CARTE': 'bg-orange-500',
            'SUPPRESSION_CARTE': 'bg-red-500',
            'ANNULATION_IMPORT': 'bg-red-500',
            'EXPORT_CARTES': 'bg-blue-500',
            'EXPORT_RECHERCHE': 'bg-blue-500',
            'DEBUT_IMPORT': 'bg-blue-400',
            'FIN_IMPORT': 'bg-blue-400',
            'TELECHARGEMENT_TEMPLATE': 'bg-purple-500',
            'CONNEXION': 'bg-gray-500',
            'DECONNEXION': 'bg-gray-400',
            'ANNULATION': 'bg-yellow-500',
            'ANNULATION_MANUEL': 'bg-yellow-600'
        };
        return colors[actionType] || 'bg-gray-500';
    };

    const getActionIcon = (actionType: string) => {
        const icons: { [key: string]: string } = {
            'IMPORT_CARTE': '📤',
            'CREATION_CARTE': '👤',
            'MODIFICATION_CARTE': '✏️',
            'SUPPRESSION_CARTE': '🗑️',
            'ANNULATION_IMPORT': '❌',
            'EXPORT_CARTES': '📥',
            'EXPORT_RECHERCHE': '📊',
            'DEBUT_IMPORT': '⏳',
            'FIN_IMPORT': '✅',
            'TELECHARGEMENT_TEMPLATE': '📋',
            'CONNEXION': '🔐',
            'DECONNEXION': '🚪',
            'ANNULATION': '↩️',
            'ANNULATION_MANUEL': '↩️'
        };
        return icons[actionType] || '📝';
    };

    // ✅ FONCTION POUR FORMATER LES NOMS DE CHAMPS
    const formatFieldName = (fieldName: string): string => {
        const fieldMap: { [key: string]: string } = {
            'LIEU_DENROLEMENT': 'Lieu d\'enrôlement',
            'SITE_DE_RETRAIT': 'Site de retrait',
            'RANGEMENT': 'Rangement',
            'NOM': 'Nom',
            'PRENOMS': 'Prénoms',
            'DATE_DE_NAISSANCE': 'Date de naissance',
            'LIEU_NAISSANCE': 'Lieu de naissance',
            'CONTACT': 'Contact',
            'DELIVRANCE': 'Délivrance',
            'CONTACT_DE_RETRAIT': 'Contact de retrait',
            'DATE_DE_DELIVRANCE': 'Date de délivrance',
            'ID': 'ID',
            'HashDoublon': 'Hash Doublon',
            'ImportBatchID': 'Batch ID',
            'DateImport': 'Date import',
            'DateCreation': 'Date création',
            'DateModification': 'Date modification'
        };
        
        if (fieldMap[fieldName]) {
            return fieldMap[fieldName];
        }
        
        return fieldName
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/\b\w/g, l => l.toUpperCase());
    };

    // ✅ FONCTION POUR FORMATER LES VALEURS
    const formatValueShort = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (value === '') return '';
        if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
        if (typeof value === 'object') return '[Object]';
        
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('fr-FR');
        }
        
        const str = String(value);
        return str.length > 20 ? str.substring(0, 20) + '...' : str;
    };

    // ✅ LISTE DES CHAMPS TECHNIQUES À IGNORER
    const technicalFields = ['ID', 'HashDoublon', 'ImportBatchID', 'DateImport', 'DateCreation', 'DateModification', 'UserID', 'UtilisateurID'];

    // ✅ FONCTION POUR GÉNÉRER LE RÉSUMÉ DES MODIFICATIONS
    const generateChangesSummary = (log: JournalEntry): string => {
        try {
            if (!log.OldValue && !log.NewValue) return 'Aucune donnée';

            if (log.ActionType === 'CREATION_CARTE' && log.NewValue) {
                const newData = log.NewValue && log.NewValue !== 'null' ? JSON.parse(log.NewValue) : {};
                const fields = Object.keys(newData).filter(key => 
                    !technicalFields.includes(key)
                );
                return `🆕 Création: ${fields.length} champ(s)`;
            }

            if (log.ActionType === 'SUPPRESSION_CARTE' && log.OldValue) {
                const oldData = log.OldValue && log.OldValue !== 'null' ? JSON.parse(log.OldValue) : {};
                const fields = Object.keys(oldData).filter(key => 
                    !technicalFields.includes(key)
                );
                return `🗑️ Suppression: ${fields.length} champ(s)`;
            }

            if (log.ActionType === 'MODIFICATION_CARTE' && log.OldValue && log.NewValue) {
                const oldData = log.OldValue && log.OldValue !== 'null' ? JSON.parse(log.OldValue) : {};
                const newData = log.NewValue && log.NewValue !== 'null' ? JSON.parse(log.NewValue) : {};
                
                const changes = [];
                const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
                
                for (const key of allKeys) {
                    if (technicalFields.includes(key)) {
                        continue;
                    }
                    
                    const oldVal = oldData[key];
                    const newVal = newData[key];
                    
                    const oldStr = String(oldVal !== null && oldVal !== undefined ? oldVal : '').trim();
                    const newStr = String(newVal !== null && newVal !== undefined ? newVal : '').trim();
                    
                    if (oldStr !== newStr) {
                        changes.push(key);
                    }
                }
                
                if (changes.length === 0) return 'Aucun changement détecté';
                
                const mainChanges = changes.slice(0, 3).map(formatFieldName);
                const extra = changes.length > 3 ? ` et ${changes.length - 3} autre(s)` : '';
                return `✏️ ${mainChanges.join(', ')}${extra}`;
            }

            return 'Action standard';
        } catch (error) {
            return 'Erreur analyse';
        }
    };

    // ✅ FONCTION POUR GÉNÉRER LES MODIFICATIONS DÉTAILLÉES
    const generateDetailedTooltip = (log: JournalEntry): string => {
        try {
            if (!log.OldValue && !log.NewValue) return 'Aucune donnée disponible';

            if (log.ActionType === 'CREATION_CARTE' && log.NewValue) {
                const newData = log.NewValue && log.NewValue !== 'null' ? JSON.parse(log.NewValue) : {};
                const details = [];
                for (const [key, value] of Object.entries(newData)) {
                    if (technicalFields.includes(key)) {
                        continue;
                    }
                    details.push(`${formatFieldName(key)}: ${formatValueShort(value)}`);
                }
                return `NOUVEAU:\n${details.join('\n')}`;
            }

            if (log.ActionType === 'SUPPRESSION_CARTE' && log.OldValue) {
                const oldData = log.OldValue && log.OldValue !== 'null' ? JSON.parse(log.OldValue) : {};
                const details = [];
                for (const [key, value] of Object.entries(oldData)) {
                    if (technicalFields.includes(key)) {
                        continue;
                    }
                    details.push(`${formatFieldName(key)}: ${formatValueShort(value)}`);
                }
                return `SUPPRIMÉ:\n${details.join('\n')}`;
            }

            if (log.ActionType === 'MODIFICATION_CARTE' && log.OldValue && log.NewValue) {
                const oldData = log.OldValue && log.OldValue !== 'null' ? JSON.parse(log.OldValue) : {};
                const newData = log.NewValue && log.NewValue !== 'null' ? JSON.parse(log.NewValue) : {};
                
                const changes = [];
                const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
                
                for (const key of allKeys) {
                    if (technicalFields.includes(key)) {
                        continue;
                    }
                    
                    const oldVal = oldData[key];
                    const newVal = newData[key];
                    
                    const oldStr = String(oldVal !== null && oldVal !== undefined ? oldVal : '').trim();
                    const newStr = String(newVal !== null && newVal !== undefined ? newVal : '').trim();
                    
                    if (oldStr !== newStr) {
                        changes.push(`${formatFieldName(key)}: "${formatValueShort(oldVal)}" → "${formatValueShort(newVal)}"`);
                    }
                }
                
                if (changes.length === 0) return 'Aucun changement détecté';
                return changes.join('\n');
            }

            return 'Action standard - voir détails complets';
        } catch (error) {
            return 'Erreur lors de l\'analyse des données';
        }
    };

    // ✅ FONCTION AMÉLIORÉE POUR AFFICHER LES MODIFICATIONS DÉTAILLÉES
    const renderDetailedChanges = (log: JournalEntry) => {
        try {
            const oldData = log.OldValue && log.OldValue !== 'null' ? JSON.parse(log.OldValue) : {};
            const newData = log.NewValue && log.NewValue !== 'null' ? JSON.parse(log.NewValue) : {};
            
            if (log.ActionType === 'CREATION_CARTE') {
                const fields = [];
                for (const [key, value] of Object.entries(newData)) {
                    if (technicalFields.includes(key)) {
                        continue;
                    }
                    fields.push({ champ: formatFieldName(key), valeur: value });
                }
                
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                            <span className="text-lg">🆕</span>
                            <span className="font-semibold">Création - {fields.length} champ(s) initialisé(s)</span>
                        </div>
                        {fields.map((field, index) => (
                            <div key={index} className="bg-green-50 border border-green-200 rounded-xl p-3">
                                <div className="font-semibold text-green-800 text-sm mb-1">{field.champ}</div>
                                <div className="text-gray-800 break-words">{formatValueShort(field.valeur) || '<Vide>'}</div>
                            </div>
                        ))}
                    </div>
                );
            }

            if (log.ActionType === 'SUPPRESSION_CARTE') {
                const fields = [];
                for (const [key, value] of Object.entries(oldData)) {
                    if (technicalFields.includes(key)) {
                        continue;
                    }
                    fields.push({ champ: formatFieldName(key), valeur: value });
                }
                
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-600">
                            <span className="text-lg">🗑️</span>
                            <span className="font-semibold">Suppression - {fields.length} champ(s) supprimé(s)</span>
                        </div>
                        {fields.map((field, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded-xl p-3">
                                <div className="font-semibold text-red-800 text-sm mb-1">{field.champ}</div>
                                <div className="text-gray-800 break-words">{formatValueShort(field.valeur) || '<Vide>'}</div>
                            </div>
                        ))}
                    </div>
                );
            }

            if (log.ActionType === 'MODIFICATION_CARTE') {
                const changes = [];
                const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
                
                for (const key of allKeys) {
                    if (technicalFields.includes(key)) {
                        continue;
                    }
                    
                    const oldVal = oldData[key];
                    const newVal = newData[key];
                    
                    const oldStr = String(oldVal !== null && oldVal !== undefined ? oldVal : '').trim();
                    const newStr = String(newVal !== null && newVal !== undefined ? newVal : '').trim();
                    
                    if (oldStr !== newStr) {
                        changes.push({ 
                            champ: formatFieldName(key),
                            ancienneValeur: oldVal,
                            nouvelleValeur: newVal
                        });
                    }
                }
                
                if (changes.length === 0) {
                    return (
                        <div className="text-center text-gray-500 py-4">
                            <div className="text-2xl mb-2">🔍</div>
                            Aucune modification détectée
                        </div>
                    );
                }
                
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                {changes.length} modification(s) détectée(s)
                            </span>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {changes.map((change, index) => (
                                <div key={index} className="border-l-4 border-orange-400 pl-4 py-3 bg-white rounded-r shadow-sm">
                                    <div className="font-semibold text-gray-800 text-sm mb-2">
                                        {change.champ}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                            <div className="text-red-700 font-medium text-xs mb-2">AVANT</div>
                                            <div className="text-gray-800 break-words">
                                                {formatValueShort(change.ancienneValeur) || '<Vide>'}
                                            </div>
                                        </div>
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                                            <div className="text-green-700 font-medium text-xs mb-2">APRÈS</div>
                                            <div className="text-gray-800 break-words">
                                                {formatValueShort(change.nouvelleValeur) || '<Vide>'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            return (
                <div className="text-center text-gray-500 py-4">
                    Aucun détail disponible pour ce type d'action
                </div>
            );
        } catch (error) {
            return (
                <div className="text-center text-red-500 py-4">
                    ❌ Erreur d'affichage des modifications
                </div>
            );
        }
    };

    // ✅ FONCTION FETCH CORRIGÉE
    const fetchLogs = async (page: number = 1) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pagination.pageSize.toString(),
                ...filters
            });

            const response = await fetch(`${API_BASE_URL}/journal?${queryParams}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            
            const data = await response.json();
            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Erreur chargement journal:', error);
            alert('Erreur lors du chargement du journal');
        } finally {
            setLoading(false);
        }
    };

    // ✅ FONCTION FETCH IMPORTS CORRIGÉE
    const fetchImports = async () => {
        setImportsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/journal/imports`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            
            const data = await response.json();
            setImports(data);
        } catch (error) {
            console.error('Erreur chargement imports:', error);
            alert('Erreur lors du chargement des imports');
        } finally {
            setImportsLoading(false);
        }
    };

    // ✅ FONCTION ANNULATION IMPORT CORRIGÉE
    const handleAnnulerImport = async () => {
        if (!selectedImport) return;

        try {
            const response = await fetch(`${API_BASE_URL}/journal/annuler-import`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ importBatchID: selectedImport })
            });

            if (response.ok) {
                setDialogOpen(false);
                setSelectedImport(null);
                fetchLogs();
                fetchImports();
                alert('✅ Importation annulée avec succès');
            } else {
                throw new Error('Erreur lors de l\'annulation');
            }
        } catch (error) {
            console.error('Erreur annulation:', error);
            alert('❌ Erreur lors de l\'annulation de l\'importation');
        }
    };

    // ✅ FONCTION POUR ANNULER LES ACTIONS
    const handleUndo = async (journalId: number) => {
        if (!window.confirm("Voulez-vous vraiment annuler cette action ?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/journal/undo/${journalId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message || "✅ Action annulée avec succès !");
                fetchLogs();
            } else {
                alert(data.message || "❌ Erreur lors de l'annulation.");
            }
        } catch (error) {
            console.error("Erreur annulation:", error);
            alert("❌ Erreur réseau ou serveur.");
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR');
    };

    const handleResetFilters = () => {
        setFilters({
            dateDebut: '',
            dateFin: '',
            utilisateur: '',
            actionType: '',
            tableName: ''
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <Navbar />
            
            {/* 🎯 EN-TÊTE AVEC STYLE ORANGE */}
            <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
                <div className="container mx-auto px-6">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <span className="bg-white/20 p-2 rounded-xl">📊</span>
                        Journal d'Activité - Surveillance Complète
                    </h1>
                    <p className="text-white/90 mt-1 text-sm">
                        Toutes les actions du système - Mode Administrateur - COORDINATION ABIDJAN NORD-COCODY
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-6">
                {/* BOUTONS PRINCIPAUX */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <motion.button
                        onClick={() => {
                            setShowImports(!showImports);
                            if (!showImports) fetchImports();
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg ${
                            showImports 
                                ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white hover:from-[#e46f00] hover:to-[#FF8C00]' 
                                : 'bg-white text-[#0077B6] border border-[#0077B6] hover:bg-blue-50'
                        }`}
                    >
                        <span className="text-lg">{showImports ? '📋' : '📦'}</span>
                        {showImports ? 'Voir Journal' : 'Voir Imports'}
                    </motion.button>
                    
                    <motion.button
                        onClick={() => {
                            fetchLogs();
                            if (showImports) fetchImports();
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-white text-[#0077B6] border border-[#0077B6] rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg"
                    >
                        <span className="text-lg">🔄</span>
                        Actualiser
                    </motion.button>
                </div>

                {showImports ? (
                    /* VUE IMPORTS */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-6 mb-6"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl">📦</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Gestion des Imports</h2>
                                <p className="text-gray-600">Surveiller et gérer les imports groupés</p>
                            </div>
                        </div>
                        
                        {importsLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-8 h-8 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-600">Chargement des imports...</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-orange-100">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white">
                                            <th className="px-4 py-3 text-left font-semibold">Date Import</th>
                                            <th className="px-4 py-3 text-left font-semibold">Utilisateur</th>
                                            <th className="px-4 py-3 text-left font-semibold">Agence</th>
                                            <th className="px-4 py-3 text-left font-semibold">Nombre de Cartes</th>
                                            <th className="px-4 py-3 text-left font-semibold">Batch ID</th>
                                            <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {imports.map((importBatch) => (
                                            <tr key={importBatch.ImportBatchID} className="border-b border-orange-100 hover:bg-orange-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-medium">{formatDate(importBatch.dateImport)}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <div className="font-semibold text-[#0077B6]">{importBatch.NomUtilisateur}</div>
                                                        <div className="text-sm text-gray-500">{importBatch.NomComplet}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-3 py-1 bg-blue-100 text-[#0077B6] rounded-full text-sm font-medium">
                                                        {importBatch.Agence}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                        {importBatch.nombreCartes} cartes
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-3 py-1 bg-orange-100 text-[#F77F00] rounded text-sm font-mono">
                                                        {importBatch.ImportBatchID.substring(0, 8)}...
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <motion.button
                                                        onClick={() => {
                                                            setSelectedImport(importBatch.ImportBatchID || null);
                                                            setDialogOpen(true);
                                                        }}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 text-sm shadow-lg"
                                                    >
                                                        <span>🗑️</span>
                                                        Annuler
                                                    </motion.button>
                                                </td>
                                            </tr>
                                        ))}
                                        {imports.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                                    <div className="text-4xl mb-3 text-[#F77F00]">📦</div>
                                                    <p className="text-lg font-medium">Aucun import trouvé</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    /* VUE JOURNAL COMPLET */
                    <>
                        {/* FILTRES */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-6 mb-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center">
                                    <span className="text-white text-lg">🔍</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Filtres Avancés</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                                {/* DATE DÉBUT */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Date début
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateDebut}
                                        onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300"
                                    />
                                </div>

                                {/* DATE FIN */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Date fin
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateFin}
                                        onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300"
                                    />
                                </div>

                                {/* UTILISATEUR */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Utilisateur
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.utilisateur}
                                        onChange={(e) => handleFilterChange('utilisateur', e.target.value)}
                                        placeholder="Nom d'utilisateur..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                                    />
                                </div>

                                {/* TYPE D'ACTION */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Type d'action
                                    </label>
                                    <select
                                        value={filters.actionType}
                                        onChange={(e) => handleFilterChange('actionType', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all duration-300"
                                    >
                                        <option value="">Tous les types</option>
                                        <option value="IMPORT_CARTE">Import</option>
                                        <option value="CREATION_CARTE">Création</option>
                                        <option value="MODIFICATION_CARTE">Modification</option>
                                        <option value="SUPPRESSION_CARTE">Suppression</option>
                                        <option value="EXPORT_CARTES">Export</option>
                                        <option value="ANNULATION_IMPORT">Annulation</option>
                                        <option value="ANNULATION">Annulation action</option>
                                        <option value="ANNULATION_MANUEL">Annulation manuelle</option>
                                    </select>
                                </div>

                                {/* TABLE */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Table
                                    </label>
                                    <select
                                        value={filters.tableName}
                                        onChange={(e) => handleFilterChange('tableName', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300"
                                    >
                                        <option value="">Toutes les tables</option>
                                        <option value="Cartes">Cartes</option>
                                        <option value="Utilisateurs">Utilisateurs</option>
                                    </select>
                                </div>
                            </div>

                            {/* BOUTONS FILTRES */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <motion.button
                                    onClick={handleResetFilters}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-3 font-medium shadow-sm"
                                >
                                    <span className="text-lg">🗑️</span>
                                    Réinitialiser
                                </motion.button>
                                
                                <div className="flex gap-3">
                                    <motion.button
                                        onClick={() => fetchLogs(1)}
                                        disabled={loading}
                                        whileHover={{ scale: loading ? 1 : 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl hover:from-[#e46f00] hover:to-[#FF8C00] disabled:opacity-50 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Recherche...
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-lg">🔍</span>
                                                Appliquer les filtres
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>

                        {/* TABLEAU DES LOGS */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white">
                                            <th className="px-4 py-4 text-left font-semibold w-12"></th>
                                            <th className="px-4 py-4 text-left font-semibold">Date/Heure</th>
                                            <th className="px-4 py-4 text-left font-semibold">Utilisateur</th>
                                            <th className="px-4 py-4 text-left font-semibold">Action</th>
                                            <th className="px-4 py-4 text-left font-semibold">Détails des modifications</th>
                                            <th className="px-4 py-4 text-left font-semibold">Table</th>
                                            <th className="px-4 py-4 text-left font-semibold">Adresse IP</th>
                                            <th className="px-4 py-4 text-left font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-12 h-12 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-gray-600 font-medium">Chargement des logs...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            logs.map((log) => (
                                                <React.Fragment key={log.JournalID}>
                                                    <tr className="border-b border-orange-100 hover:bg-orange-50 transition-colors">
                                                        <td className="px-4 py-4">
                                                            <motion.button
                                                                onClick={() => setExpandedRow(expandedRow === log.JournalID ? null : log.JournalID)}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="w-10 h-10 flex items-center justify-center text-[#F77F00] hover:bg-orange-100 rounded-xl transition-all duration-300"
                                                            >
                                                                {expandedRow === log.JournalID ? '▼' : '►'}
                                                            </motion.button>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="font-medium">{formatDate(log.DateAction)}</span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div>
                                                                <div className="font-semibold text-[#0077B6]">{log.NomUtilisateur}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    {log.Role} • {log.Agence}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl">{getActionIcon(log.ActionType)}</span>
                                                                <div>
                                                                    <span className={`px-3 py-2 ${getActionColor(log.ActionType)} text-white rounded-xl text-sm font-semibold shadow-sm`}>
                                                                        {log.ActionType}
                                                                    </span>
                                                                    <div className="text-xs text-gray-500 mt-2">
                                                                        {log.Action}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div 
                                                                className="text-sm text-gray-700 cursor-help"
                                                                title={generateDetailedTooltip(log)}
                                                            >
                                                                {generateChangesSummary(log)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
                                                                {log.TableName || log.TableAffectee}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                                {log.AdresseIP || log.IPUtilisateur}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex gap-2">
                                                                {log.ActionType === 'IMPORT_CARTE' && log.ImportBatchID && (
                                                                    <motion.button
                                                                        onClick={() => {
                                                                            setSelectedImport(log.ImportBatchID || null);
                                                                            setDialogOpen(true);
                                                                        }}
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 text-sm shadow-lg"
                                                                    >
                                                                        <span>❌</span>
                                                                        Annuler
                                                                    </motion.button>
                                                                )}
                                                                
                                                                {(log.ActionType === 'MODIFICATION_CARTE' || log.ActionType === 'CREATION_CARTE' || log.ActionType === 'SUPPRESSION_CARTE') && log.OldValue && (
                                                                    <motion.button
                                                                        onClick={() => handleUndo(log.JournalID)}
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center gap-2 text-sm shadow-lg"
                                                                    >
                                                                        <span>↩️</span>
                                                                        Annuler
                                                                    </motion.button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {expandedRow === log.JournalID && (
                                                        <tr className="bg-blue-50">
                                                            <td colSpan={8} className="px-6 py-6">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    <div className="md:col-span-2">
                                                                        <h4 className="font-semibold text-[#0077B6] mb-3 flex items-center gap-3">
                                                                            <span className="text-lg">📋</span>
                                                                            Description complète de l'action
                                                                        </h4>
                                                                        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm">
                                                                            <p className="text-sm whitespace-pre-wrap">{log.DetailsAction || log.Action || "Aucune description disponible"}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="md:col-span-2">
                                                                        <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-3">
                                                                            <span className="text-lg">🔄</span>
                                                                            Détails des modifications
                                                                        </h4>
                                                                        <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-sm">
                                                                            {renderDetailedChanges(log)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        )}
                                        {!loading && logs.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                                    <div className="text-4xl mb-3 text-[#F77F00]">📝</div>
                                                    <p className="text-lg font-medium">Aucun log trouvé pour ces critères</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINATION */}
                            {pagination.totalPages > 1 && (
                                <div className="flex flex-col md:flex-row justify-between items-center p-6 border-t border-orange-100 gap-4">
                                    <div className="text-sm text-gray-600 font-medium">
                                        {pagination.total} logs au total
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                                        <motion.button
                                            onClick={() => fetchLogs(pagination.page - 1)}
                                            disabled={pagination.page <= 1}
                                            whileHover={{ scale: pagination.page <= 1 ? 1 : 1.1 }}
                                            className="w-10 h-10 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] disabled:opacity-30 transition duration-200 flex items-center justify-center font-bold"
                                        >
                                            ←
                                        </motion.button>
                                        <span className="px-4 py-2 bg-white border border-orange-200 rounded-lg font-semibold text-[#F77F00] text-sm">
                                            Page {pagination.page} / {pagination.totalPages}
                                        </span>
                                        <motion.button
                                            onClick={() => fetchLogs(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.totalPages}
                                            whileHover={{ scale: pagination.page >= pagination.totalPages ? 1 : 1.1 }}
                                            className="w-10 h-10 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] disabled:opacity-30 transition duration-200 flex items-center justify-center font-bold"
                                        >
                                            →
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </div>

            {/* MODAL DE CONFIRMATION D'ANNULATION */}
            {dialogOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-auto border border-orange-100"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl">⚠️</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Confirmation d'annulation</h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Êtes-vous sûr de vouloir annuler cette importation ? 
                            Toutes les cartes de ce batch seront définitivement supprimées.
                            Cette action est irréversible.
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <motion.button
                                onClick={() => setDialogOpen(false)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                            >
                                Annuler
                            </motion.button>
                            <motion.button
                                onClick={handleAnnulerImport}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg"
                            >
                                Confirmer l'annulation
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Journal;