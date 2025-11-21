import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CoordinationInfo: React.FC = () => {
  const [infoIndex, setInfoIndex] = useState(0);
  
  const informations = [
    {
      icon: "🚨",
      title: "OPÉRATION SPÉCIALE DE DISTRIBUTION - URGENT",
      subtitle: "Lancement IMMÉDIAT - Mobilisation GÉNÉRALE requise",
      content: `ATTENTION : Nous informons TOUS les chefs d'équipe ainsi que l'ensemble des opérateurs de la Coordination Abidjan Nord Cocody que débutera CE LUNDI 17 l'opération spéciale de distribution de GRANDE AMPLEUR lancée par notre direction.

🚨 MOBILISATION TOTALE REQUISE : Nous invitons CHACUN à se mobiliser INTÉGRALEMENT afin d'assurer la distribution du MAXIMUM de cartes. Notre coordination DOIT figurer parmi les MEILLEURES de Côte d'Ivoire.

🎯 OBJECTIF PRIORITAIRE : Je compte sur votre ENGAGEMENT TOTAL et votre DÉTERMINATION ABSOLUE pour ATTEINDRE et DÉPASSER nos objectifs.`,
      urgency: "critical",
      deadline: "DÉBUT IMMÉDIAT - LUNDI 17",
      type: "distribution"
    },
    {
      icon: "🔵",
      title: "NOVEMBRE BLEU - Campagne de Sensibilisation",
      subtitle: "Mois de la santé masculine - Soyons vigilants",
      content: `Chers collaborateurs,

Dans le cadre de la campagne "NOVEMBRE BLEU", mois dédié à la santé masculine et à la prévention du cancer de la prostate, nous vous encourageons vivement à :

• 🩺 Effectuer des bilans de santé réguliers
• 💙 Parler de votre santé sans tabou
• 👥 Sensibiliser votre entourage
• 🏥 Consulter précocement en cas de symptômes

Votre santé est notre priorité. Prenons soin de nous pour mieux servir nos bénéficiaires.

"Un homme averti en vaut deux" - Ensemble, préservons notre capital santé.`,
      urgency: "important",
      deadline: "Tout le mois de Novembre",
      type: "sante"
    },
    {
      icon: "ℹ️",
      title: "Informations Générales",
      subtitle: "Amélioration continue de nos services",
      content: `La Coordination Abidjan Nord Cocody reste engagée dans l'amélioration continue de nos services. 

N'hésitez pas à remonter toutes suggestions d'amélioration via les canaux dédiés. Votre feedback est essentiel pour notre progression collective.

Ensemble, continuons à fournir un service d'excellence à nos bénéficiaires.`,
      urgency: "normal",
      deadline: "Permanent",
      type: "information"
    }
  ];

  useEffect(() => {
    const infoTimer = setInterval(() => {
      setInfoIndex((prev) => (prev + 1) % informations.length);
    }, 30000);
    return () => clearInterval(infoTimer);
  }, [informations.length]);

  const currentInfo = informations[infoIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl border border-green-200 overflow-hidden relative"
    >
      {/* RUBAN BLEU SUBTIL POUR NOVEMBRE BLEU */}
      {currentInfo.type === "sante" && (
        <div className="absolute -top-2 -right-2 w-24 h-24 overflow-hidden">
          <div className="absolute top-4 -right-8 w-32 bg-blue-500 text-white text-xs font-bold py-1 text-center transform rotate-45 shadow-lg">
            NOVEMBRE BLEU
          </div>
        </div>
      )}

      {/* EN-TÊTE AVEC COULEUR VARIABLE */}
      <div className={`p-6 text-white ${
        currentInfo.urgency === "critical" 
          ? "bg-gradient-to-r from-red-600 to-red-500 animate-pulse" 
          : currentInfo.urgency === "important"
          ? "bg-gradient-to-r from-blue-600 to-blue-500"
          : "bg-gradient-to-r from-[#0077B6] to-[#2E8B57]"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-sm ${
              currentInfo.urgency === "critical" 
                ? "bg-white/30" 
                : currentInfo.urgency === "important"
                ? "bg-white/30"
                : "bg-white/20"
            }`}>
              <span className="text-2xl">{currentInfo.icon}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {currentInfo.urgency === "critical" 
                  ? "ALERTE URGENTE" 
                  : currentInfo.urgency === "important"
                  ? "NOVEMBRE BLEU"
                  : "Informations Coordination"}
              </h2>
              <p className={
                currentInfo.urgency === "critical" 
                  ? "text-red-100" 
                  : currentInfo.urgency === "important"
                  ? "text-blue-100"
                  : "text-blue-100"
              }>
                {currentInfo.urgency === "critical" 
                  ? "Message de priorité MAXIMALE" 
                  : currentInfo.urgency === "important"
                  ? "Campagne de santé masculine"
                  : "Messages importants de la direction"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm px-3 py-1 rounded-lg ${
              currentInfo.urgency === "critical" 
                ? "bg-white/30" 
                : currentInfo.urgency === "important"
                ? "bg-white/30"
                : "bg-white/20"
            }`}>
              {infoIndex + 1}/{informations.length}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={infoIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* EN-TÊTE DU MESSAGE */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                currentInfo.urgency === "critical" 
                  ? "bg-red-100 text-red-600" 
                  : currentInfo.urgency === "important"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-blue-100 text-blue-600"
              }`}>
                <span className="text-xl">{currentInfo.icon}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    {currentInfo.title}
                  </h3>
                  {currentInfo.urgency === "critical" && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                      🚨 PRIORITÉ MAXIMALE
                    </span>
                  )}
                  {currentInfo.urgency === "important" && (
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                      💙 SANTÉ IMPORTANTE
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-3 text-lg">
                  {currentInfo.subtitle}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                    <span>📅</span>
                    <span className="font-medium">{currentInfo.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                    <span>⏱️</span>
                    <span>30s auto</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENU DU MESSAGE */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {currentInfo.content}
              </div>
            </div>

            {/* SIGNATURE ET INDICATEURS */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">RL</span>
                </div>
                <div>
                  <p className="font-semibold text-[#2E8B57]">La Responsable</p>
                  <p className="text-xs text-gray-500">Coordination Abidjan Nord-Cocody</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {informations.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setInfoIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === infoIndex 
                        ? (currentInfo.urgency === "critical" 
                            ? 'bg-red-500 scale-125' 
                            : currentInfo.urgency === "important"
                            ? 'bg-blue-500 scale-125'
                            : 'bg-[#0077B6] scale-125') 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* BOUTONS DE NAVIGATION */}
        <div className="flex justify-center gap-3 mt-6">
          {informations.map((info, index) => (
            <button
              key={index}
              onClick={() => setInfoIndex(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                index === infoIndex
                  ? (info.urgency === "critical" 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : info.urgency === "important"
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-[#0077B6] text-white shadow-lg')
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>{info.icon}</span>
              <span>
                {info.type === "distribution" 
                  ? "Distribution" 
                  : info.type === "sante"
                  ? "Novembre Bleu"
                  : "Information"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CoordinationInfo;