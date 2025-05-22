import React, { useState, useEffect } from 'react';
import { ProjetRealise, PropositionTheme } from '@/types';
import { ProjetsRealises } from './projets-realises';
import { PropositionsThemes } from './propositions-themes';

// Exporter les données fictives pour les réutiliser dans d'autres composants
export const projetsFictifs: ProjetRealise[] = [
  {
    id: 1,
    titre: "Système de gestion des stages",
    description: "Un système web pour gérer les stages des étudiants, incluant un suivi des candidatures et des propositions d'entreprises.",
    auteur: "Ahmed Benali",
    annee: "2022",
    filiere: "Génie Informatique",
    technologies: ["React", "Node.js", "MongoDB", "Express"],
    points_forts: ["Interface intuitive", "Système de suivi avancé", "Notifications automatiques"],
    points_amelioration: ["Ajouter un tableau de bord statistique", "Intégrer un système de chat"],
    date_ajout: "12/03/2023"
  },
  {
    id: 2,
    titre: "Application mobile de covoiturage",
    description: "Une application qui permet aux étudiants de partager des trajets pour se rendre à l'université, réduisant ainsi les émissions de CO2.",
    auteur: "Salima Nejjar",
    annee: "2021",
    filiere: "Génie Informatique",
    technologies: ["Flutter", "Firebase", "Google Maps API"],
    points_forts: ["Calcul intelligent des itinéraires", "Système de paiement intégré", "Profils vérifiés"],
    points_amelioration: ["Améliorer les performances sur Android", "Ajouter un mode hors-ligne"],
    date_ajout: "25/05/2022"
  },
  {
    id: 3,
    titre: "Outil de prévision météorologique",
    description: "Un système utilisant l'IA pour prédire les conditions météorologiques locales avec une précision accrue.",
    auteur: "Karim Idrissi",
    annee: "2023",
    filiere: "Génie Civil",
    technologies: ["Python", "TensorFlow", "Flask", "D3.js"],
    points_forts: ["Précision de 85%", "Visualisations interactives", "API disponible"],
    points_amelioration: ["Étendre la couverture géographique", "Réduire la latence des prédictions"],
    date_ajout: "03/01/2023"
  },
  {
    id: 4,
    titre: "Plateforme d'apprentissage en ligne",
    description: "Une plateforme LMS permettant aux enseignants de créer des cours interactifs et aux étudiants de suivre leur progression.",
    auteur: "Fatima Zahra El Alaoui",
    annee: "2022",
    filiere: "Génie Électrique",
    technologies: ["Vue.js", "Laravel", "MySQL", "WebSockets"],
    points_forts: ["Interfaces adaptatives", "Quiz interactifs", "Suivi de progression personnalisé"],
    points_amelioration: ["Ajouter un système de certification", "Améliorer l'accessibilité"],
    date_ajout: "17/11/2022"
  }
];

export const propositionsFictives: PropositionTheme[] = [
  {
    id: 1,
    titre: "Système de reconnaissance de plantes médicinales",
    description: "Développer une application qui utilise la vision par ordinateur pour identifier les plantes médicinales et fournir des informations sur leurs propriétés et utilisations.",
    fonctionnalites: [
      "Reconnaissance d'image en temps réel",
      "Base de données détaillée des plantes",
      "Conseils d'utilisation et précautions",
      "Mode hors-ligne pour zones rurales"
    ],
    auteur: {
      nom: "Dr. Mohammed Bennani",
      type: "Enseignant"
    },
    difficulte: "Intermédiaire",
    technologies_suggerees: ["Python", "TensorFlow", "OpenCV", "Flutter/React Native"],
    date_ajout: "15/04/2023"
  },
  {
    id: 2,
    titre: "Plateforme de gestion de déchets électroniques",
    description: "Créer un système qui permet de tracer et gérer le recyclage des déchets électroniques, facilitant la mise en relation entre consommateurs et centres de recyclage.",
    fonctionnalites: [
      "Cartographie des points de collecte",
      "Scan de codes-barres pour identification",
      "Suivi du cycle de recyclage",
      "Statistiques environnementales"
    ],
    auteur: {
      nom: "Association GreenTech",
      type: "Autre"
    },
    difficulte: "Difficile",
    technologies_suggerees: ["React", "Node.js", "MongoDB", "IoT (Arduino/Raspberry Pi)"],
    date_ajout: "02/03/2023"
  },
  {
    id: 3,
    titre: "Assistant virtuel pour orientation universitaire",
    description: "Développer un chatbot intelligent qui aide les nouveaux étudiants à s'orienter dans leurs choix de filières et de cours en fonction de leurs intérêts et compétences.",
    fonctionnalites: [
      "Analyse des intérêts et compétences",
      "Recommandations personnalisées de filières",
      "Informations sur les débouchés professionnels",
      "Mise en relation avec des étudiants actuels"
    ],
    auteur: {
      nom: "Comité d'orientation",
      type: "Autre"
    },
    difficulte: "Intermédiaire",
    technologies_suggerees: ["NLP", "RASA/Dialogflow", "Python", "Web/Mobile"],
    date_ajout: "20/01/2023"
  },
  {
    id: 4,
    titre: "Outil de création de quiz interactifs",
    description: "Créer une plateforme permettant aux enseignants de générer facilement des quiz interactifs avec différents types de questions et feedback personnalisé.",
    fonctionnalites: [
      "Multiples types de questions (QCM, texte, association...)",
      "Feedback automatique et personnalisé",
      "Suivi des performances et statistiques",
      "Export et partage des quiz"
    ],
    auteur: {
      nom: "Youssef Amrani",
      type: "Étudiant"
    },
    difficulte: "Facile",
    technologies_suggerees: ["JavaScript", "React/Vue", "Firebase/Supabase"],
    date_ajout: "05/05/2023"
  }
];

interface ProjetsTabProps {
  // Props si nécessaire
}

export const ProjetsTab: React.FC<ProjetsTabProps> = () => {
  const [activeTab, setActiveTab] = useState<'realises' | 'propositions'>('realises');
  const [loading, setLoading] = useState(true);
  const [projets, setProjets] = useState<ProjetRealise[]>([]);
  const [propositions, setPropositions] = useState<PropositionTheme[]>([]);

  // Charger les données (simulées pour l'instant)
  useEffect(() => {
    setLoading(true);
    
    // Simuler un appel API
    setTimeout(() => {
      setProjets(projetsFictifs);
      setPropositions(propositionsFictives);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Projets</h2>
      
      {/* Navigation entre les onglets */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'realises'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('realises')}
        >
          Projets réalisés
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'propositions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('propositions')}
        >
          Propositions de thèmes
        </button>
      </div>
      
      {/* État de chargement */}
      {loading ? (
        <div className="py-8 flex justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Afficher le composant en fonction de l'onglet actif */}
          {activeTab === 'realises' ? (
            <ProjetsRealises projets={projets} />
          ) : (
            <PropositionsThemes propositions={propositions} />
          )}
        </>
      )}
    </div>
  );
};