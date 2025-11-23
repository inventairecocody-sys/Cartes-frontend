import React from 'react';
import { motion } from 'framer-motion';

const WelcomeMessage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden"
    >
      {/* EN-TÊTE AVEC GRADIENT ORANGE */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">👋</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Message de Bienvenue</h2>
            <p className="text-orange-100">Nouvelle plateforme GESCARD</p>
          </div>
        </div>
      </div>

      {/* CONTENU UNIQUE ET AMÉLIORÉ */}
      <div className="p-6">
        <div className="space-y-4 text-gray-800">
          <p className="text-lg leading-relaxed">
            <strong className="text-[#F77F00]">Chers collaborateurs,</strong>
          </p>
          
          <p className="text-lg leading-relaxed">
            J'ai le plaisir de vous annoncer la mise en place de notre nouveau logiciel Web de recherche rapide de cartes <strong>GESCARD</strong>. 
          </p>

          <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <span className="text-blue-600 text-xl mt-1">🎯</span>
            <p className="text-lg leading-relaxed">
              Cette plateforme a été conçue pour <strong>faciliter et améliorer</strong> nos services de distribution, en permettant à chacun d'effectuer des recherches plus <strong>simples, plus rapides et plus efficaces</strong>.
            </p>
          </div>

          <p className="text-lg leading-relaxed">
            Cet outil est désormais accessible à tous les membres de la coordination et constitue une <strong>étape importante</strong> dans la modernisation de notre travail au quotidien.
          </p>

          <div className="flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-100">
            <span className="text-green-600 text-xl mt-1">💪</span>
            <p className="text-lg leading-relaxed">
              Je vous encourage à l'utiliser pleinement afin d'<strong>optimiser nos performances</strong> et de <strong>mieux servir nos bénéficiaires</strong>.
            </p>
          </div>

          <p className="text-lg leading-relaxed">
            Bienvenue sur cette nouvelle plateforme, et merci pour votre engagement continu.
          </p>

          {/* SIGNATURE AMÉLIORÉE */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">RL</span>
                </div>
                <div>
                  <p className="font-bold text-lg text-[#F77F00]">La Responsable</p>
                  <p className="text-sm text-gray-600">Coordination Abidjan Nord-Cocody</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 italic">Innovation • Performance • Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeMessage;