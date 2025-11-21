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
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      if (dontShowAgain) localStorage.setItem('hideImportInstructions', 'true');
      onClose();
    }
  };

  const downloadTemplate = async () => {
    try {
      setTemplateLoading(true);
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role') || ''; // ⚠️ AJOUT IMPORTANT
      
      const response = await fetch('/api/import-export/template', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-User-Role': role, // ⚠️ AJOUT CRITIQUE
        },
      });

      if (!response.ok) throw new Error('Erreur');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-import-cartes.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      alert('❌ Erreur téléchargement');
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100"
          >
            {/* En-tête */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Importation</h2>
                <p className="text-sm text-gray-500">Fichier Excel</p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                disabled={isImporting}
              >
                ×
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">📥</span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800 mb-1">Comment importer</p>
                  <ol className="text-gray-600 space-y-1">
                    <li>1. Téléchargez le modèle</li>
                    <li>2. Remplissez les données</li>
                    <li>3. Importez le fichier</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Template */}
            <button
              onClick={downloadTemplate}
              disabled={templateLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium mb-4 flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              {templateLoading ? <LoadingSpinner /> : "📋"}
              {templateLoading ? "Téléchargement..." : "Modèle Excel"}
            </button>

            {/* Upload */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-6 bg-gray-50/50">
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
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium inline-flex items-center gap-2 cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
              >
                {isImporting ? <LoadingSpinner /> : "📁"}
                {isImporting ? "Import..." : "Choisir un fichier"}
              </label>
              
              {selectedFile && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-green-600 font-medium bg-green-50 py-2 px-3 rounded-lg"
                >
                  ✅ {selectedFile.name}
                </motion.p>
              )}
            </div>

            {/* Option */}
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                disabled={isImporting}
              />
              <label htmlFor="dontShowAgain" className="ml-2 text-sm text-gray-600">
                Ne plus afficher cette aide
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isImporting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || isImporting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isImporting ? <LoadingSpinner /> : "🚀"}
                Importer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImportModal;