import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  isImporting?: boolean;
}

const ImportModal: React.FC<ImportModalProps> = ({ 
  isOpen, 
  onClose, 
  onFileSelect, 
  isImporting = false 
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      
      // Vérification du type de fichier
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('❌ Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
        return;
      }
      
      // Vérification de la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ Le fichier est trop volumineux (max 10MB)');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      if (dontShowAgain) {
        localStorage.setItem('hideImportInstructions', 'true');
      }
      // Réinitialiser l'état
      setSelectedFile(null);
      setDontShowAgain(false);
    }
  };

  const handleClose = () => {
    // Réinitialiser l'état à la fermeture
    setSelectedFile(null);
    setDontShowAgain(false);
    onClose();
  };

  const downloadTemplate = async () => {
    try {
      setTemplateLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('📥 Téléchargement du modèle Excel...');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/import-export/template`, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        alert('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `modele-import-cartes-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ Modèle Excel téléchargé avec succès');
      
    } catch (error: any) {
      console.error('❌ Erreur téléchargement modèle:', error);
      alert('❌ Erreur lors du téléchargement du modèle');
    } finally {
      setTemplateLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📤</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Importation Excel</h2>
                  <p className="text-sm text-gray-500">Ajouter des cartes depuis un fichier</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                disabled={isImporting}
              >
                ×
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm">📥</span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800 mb-2">Comment importer</p>
                  <ol className="text-gray-600 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">1</span>
                      Téléchargez le modèle Excel
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
                      Remplissez les colonnes obligatoires
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                      Importez le fichier complété
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Template Download */}
            <div className="mb-6">
              <button
                onClick={downloadTemplate}
                disabled={templateLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#0077B6] to-[#0056b3] text-white rounded-xl font-medium flex items-center justify-center gap-3 hover:from-[#0056b3] hover:to-[#004494] disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
              >
                {templateLoading ? (
                  <LoadingSpinner />
                ) : (
                  <span className="text-lg">📋</span>
                )}
                {templateLoading ? "Téléchargement..." : "Télécharger le modèle"}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Format .xlsx - Tous les champs sont prédéfinis
              </p>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-6 bg-gray-50/50 transition-colors hover:border-[#F77F00]">
              <input
                type="file"
                id="fileInput"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                disabled={isImporting}
              />
              <label
                htmlFor="fileInput"
                className={`px-6 py-3 bg-gradient-to-r from-[#F77F00] to-[#e46f00] text-white rounded-xl font-medium inline-flex items-center gap-3 cursor-pointer transition-all shadow-lg hover:shadow-xl ${
                  isImporting ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#e46f00] hover:to-[#d45f00]'
                }`}
              >
                {isImporting ? <LoadingSpinner /> : <span className="text-lg">📁</span>}
                {isImporting ? "Import en cours..." : "Choisir un fichier"}
              </label>
              
              {selectedFile && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <div className="text-left">
                        <p className="text-green-800 font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-green-600 text-xs">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="w-6 h-6 rounded-full hover:bg-green-200 flex items-center justify-center text-green-600 text-xs"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}
              
              {!selectedFile && (
                <p className="text-gray-500 text-sm mt-3">
                  Formats acceptés: .xlsx, .xls (max 10MB)
                </p>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-[#F77F00] rounded focus:ring-[#F77F00] border-gray-300"
                disabled={isImporting}
              />
              <label htmlFor="dontShowAgain" className="ml-3 text-sm text-gray-600">
                Ne plus afficher ces instructions
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isImporting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || isImporting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F77F00] to-[#e46f00] text-white rounded-xl font-medium hover:from-[#e46f00] hover:to-[#d45f00] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {isImporting ? <LoadingSpinner /> : <span className="text-lg">🚀</span>}
                {isImporting ? "Import..." : "Importer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImportModal;