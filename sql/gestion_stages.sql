-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 21 mai 2025 à 19:53
-- Version du serveur : 8.2.0
-- Version de PHP : 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_stages`
--

DELIMITER $$
--
-- Procédures
--
DROP PROCEDURE IF EXISTS `enregistrer_activite`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `enregistrer_activite` (IN `p_type` VARCHAR(50), IN `p_description` TEXT, IN `p_valeur` INT, IN `p_user_id` INT)   BEGIN
  INSERT INTO activites_recentes (type_activite, type, description, valeur, date_activite, date_creation, user_id) 
  VALUES (p_type, p_type, p_description, p_valeur, NOW(), NOW(), p_user_id);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `activites_recentes`
--

DROP TABLE IF EXISTS `activites_recentes`;
CREATE TABLE IF NOT EXISTS `activites_recentes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_activite` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valeur` int NOT NULL DEFAULT '0',
  `date_activite` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `activites_recentes`
--

INSERT INTO `activites_recentes` (`id`, `type_activite`, `description`, `valeur`, `date_activite`, `created_at`, `updated_at`, `user_id`, `type`, `date_creation`) VALUES
(1, 'inscription_etudiants', 'Nouveaux étudiants inscrits', 8, '2025-05-14', '2025-05-21 18:02:53', '2025-05-21 19:43:03', NULL, 'inscription', '2025-05-13 23:00:00'),
(2, 'propositions_stages', 'Nouvelles propositions de stages', 3, '2025-05-16', '2025-05-21 18:02:53', '2025-05-21 19:43:03', NULL, 'proposition_stage', '2025-05-15 23:00:00'),
(3, 'conventions_signees', 'Nouvelles conventions signées', 5, '2025-05-18', '2025-05-21 18:02:53', '2025-05-21 19:43:03', NULL, 'convention', '2025-05-17 23:00:00'),
(4, 'memoires_soumis', 'Mémoires soumis pour évaluation', 4, '2025-05-20', '2025-05-21 18:02:53', '2025-05-21 19:43:03', NULL, 'memoire', '2025-05-19 23:00:00'),
(5, 'soutenances_programmees', 'Soutenances programmées', 6, '2025-05-21', '2025-05-21 18:02:53', '2025-05-21 19:43:03', NULL, 'soutenance', '2025-05-20 23:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `activites_recentes_backup`
--

DROP TABLE IF EXISTS `activites_recentes_backup`;
CREATE TABLE IF NOT EXISTS `activites_recentes_backup` (
  `id` int NOT NULL DEFAULT '0',
  `type_activite` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valeur` int NOT NULL DEFAULT '0',
  `date_activite` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `activites_recentes_backup`
--

INSERT INTO `activites_recentes_backup` (`id`, `type_activite`, `description`, `valeur`, `date_activite`, `created_at`, `updated_at`) VALUES
(1, 'inscription_etudiants', 'Nouveaux étudiants inscrits', 8, '2025-05-14', '2025-05-21 18:02:53', '2025-05-21 18:02:53'),
(2, 'propositions_stages', 'Nouvelles propositions de stages', 3, '2025-05-16', '2025-05-21 18:02:53', '2025-05-21 18:02:53'),
(3, 'conventions_signees', 'Nouvelles conventions signées', 5, '2025-05-18', '2025-05-21 18:02:53', '2025-05-21 18:02:53'),
(4, 'memoires_soumis', 'Mémoires soumis pour évaluation', 4, '2025-05-20', '2025-05-21 18:02:53', '2025-05-21 18:02:53'),
(5, 'soutenances_programmees', 'Soutenances programmées', 6, '2025-05-21', '2025-05-21 18:02:53', '2025-05-21 18:02:53');

-- --------------------------------------------------------

--
-- Structure de la table `administrateurs`
--

DROP TABLE IF EXISTS `administrateurs`;
CREATE TABLE IF NOT EXISTS `administrateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricule` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricule` (`matricule`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `administrateurs`
--

INSERT INTO `administrateurs` (`id`, `matricule`, `mot_de_passe`, `created_at`, `updated_at`) VALUES
(1, 'ADMIN001', '$2b$10$fx0dyOP.fFyza1rN9zcbgOPdHMfpmZ/Vu4.wyR3K5IOK/EeqfXkAm', '2025-05-21 17:34:34', '2025-05-21 17:34:34');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `dashboard_activites`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `dashboard_activites`;
CREATE TABLE IF NOT EXISTS `dashboard_activites` (
`created_at` timestamp
,`date_activite` date
,`description` varchar(255)
,`id` int
,`type_activite` varchar(50)
,`updated_at` timestamp
,`valeur` int
);

-- --------------------------------------------------------

--
-- Structure de la table `entreprises`
--

DROP TABLE IF EXISTS `entreprises`;
CREATE TABLE IF NOT EXISTS `entreprises` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departement` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commune` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quartier` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `entreprises`
--

INSERT INTO `entreprises` (`id`, `nom`, `departement`, `commune`, `quartier`, `adresse`, `telephone`, `email`, `created_at`, `updated_at`) VALUES
(1, 'AGO Sarl ', 'Colines ', 'Avrankou ', 'Godomey', NULL, NULL, NULL, '2025-05-17 21:15:04', '2025-05-17 21:15:04');

-- --------------------------------------------------------

--
-- Structure de la table `evaluations`
--

DROP TABLE IF EXISTS `evaluations`;
CREATE TABLE IF NOT EXISTS `evaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stage_id` int NOT NULL,
  `note` decimal(4,2) DEFAULT NULL,
  `observation` text COLLATE utf8mb4_unicode_ci,
  `date_evaluation` date NOT NULL,
  `evaluateur_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `evaluateur_id` (`evaluateur_id`),
  KEY `idx_evaluations_stage` (`stage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `filieres`
--

DROP TABLE IF EXISTS `filieres`;
CREATE TABLE IF NOT EXISTS `filieres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `filieres`
--

INSERT INTO `filieres` (`id`, `nom`, `created_at`, `updated_at`) VALUES
(1, 'GEI/EE', '2025-05-15 15:29:08', '2025-05-15 15:29:08'),
(2, 'GEI/IT', '2025-05-15 15:29:08', '2025-05-15 15:29:08'),
(3, 'GE/ER', '2025-05-15 15:29:08', '2025-05-15 15:29:08'),
(4, 'GMP', '2025-05-15 15:29:08', '2025-05-15 15:29:08'),
(5, 'MSY/MI', '2025-05-15 15:29:08', '2025-05-15 15:29:08'),
(6, 'ER/SE', '2025-05-15 15:29:08', '2025-05-15 15:29:08'),
(7, 'GC/A', '2025-05-15 15:29:08', '2025-05-15 15:29:08'),
(8, 'GC/B', '2025-05-15 15:29:08', '2025-05-15 15:29:08'),
(9, 'MSY/MA', '2025-05-15 15:29:08', '2025-05-15 15:29:08'),
(10, 'GE/FC', '2025-05-15 15:29:08', '2025-05-15 15:29:08');

-- --------------------------------------------------------

--
-- Structure de la table `maitres_memoire`
--

DROP TABLE IF EXISTS `maitres_memoire`;
CREATE TABLE IF NOT EXISTS `maitres_memoire` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('permanent','vacataire') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `maitres_memoire`
--

INSERT INTO `maitres_memoire` (`id`, `nom`, `prenom`, `telephone`, `email`, `statut`, `created_at`, `updated_at`) VALUES
(1, 'Lokossou  Harris ', '', '98098909', 'lokossous@gmail.com', 'permanent', '2025-05-17 21:15:04', '2025-05-17 21:15:04');

-- --------------------------------------------------------

--
-- Structure de la table `maitres_stage`
--

DROP TABLE IF EXISTS `maitres_stage`;
CREATE TABLE IF NOT EXISTS `maitres_stage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fonction` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entreprise_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_maitres_stage_entreprise` (`entreprise_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `maitres_stage`
--

INSERT INTO `maitres_stage` (`id`, `nom`, `prenom`, `telephone`, `email`, `fonction`, `entreprise_id`, `created_at`, `updated_at`) VALUES
(1, 'AGOSSOUS', ' jean', '01999343', 'agossous@gmail.com', 'DG', 1, '2025-05-17 21:15:04', '2025-05-17 21:15:04');

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `lue` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `parametres_filieres`
--

DROP TABLE IF EXISTS `parametres_filieres`;
CREATE TABLE IF NOT EXISTS `parametres_filieres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filiere_id` int NOT NULL,
  `nb_etudiants` int NOT NULL DEFAULT '0',
  `nb_stages_requis` int NOT NULL DEFAULT '0',
  `pourcentage_reussite` decimal(5,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `filiere_id` (`filiere_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `parametres_filieres`
--

INSERT INTO `parametres_filieres` (`id`, `filiere_id`, `nb_etudiants`, `nb_stages_requis`, `pourcentage_reussite`, `created_at`, `updated_at`) VALUES
(1, 1, 25, 18, 72.00, '2025-05-21 18:02:52', '2025-05-21 18:02:52'),
(2, 2, 30, 20, 66.67, '2025-05-21 18:02:52', '2025-05-21 18:02:52'),
(3, 3, 22, 15, 68.18, '2025-05-21 18:02:52', '2025-05-21 18:02:52'),
(4, 4, 18, 12, 66.67, '2025-05-21 18:02:52', '2025-05-21 18:02:52'),
(5, 5, 20, 15, 75.00, '2025-05-21 18:02:52', '2025-05-21 18:02:52'),
(6, 6, 15, 10, 66.67, '2025-05-21 18:02:52', '2025-05-21 18:02:52'),
(7, 7, 24, 18, 75.00, '2025-05-21 18:02:52', '2025-05-21 18:02:52'),
(8, 8, 22, 17, 77.27, '2025-05-21 18:02:52', '2025-05-21 18:02:52'),
(9, 9, 16, 12, 75.00, '2025-05-21 18:02:52', '2025-05-21 18:02:52'),
(10, 10, 20, 15, 75.00, '2025-05-21 18:02:52', '2025-05-21 18:02:52');

-- --------------------------------------------------------

--
-- Structure de la table `parametres_systeme`
--

DROP TABLE IF EXISTS `parametres_systeme`;
CREATE TABLE IF NOT EXISTS `parametres_systeme` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valeur` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `parametres_systeme`
--

INSERT INTO `parametres_systeme` (`id`, `nom`, `valeur`, `description`, `created_at`, `updated_at`) VALUES
(1, 'date_debut_stages', '2025-06-01', 'Date de début officielle des stages', '2025-05-21 18:02:54', '2025-05-21 18:02:54'),
(2, 'date_fin_stages', '2025-12-31', 'Date de fin officielle des stages', '2025-05-21 18:02:54', '2025-05-21 18:02:54'),
(3, 'date_limite_soumission', '2025-06-30', 'Date limite de soumission des informations de stage', '2025-05-21 18:02:54', '2025-05-21 18:02:54'),
(4, 'duree_min_stage', '4', 'Durée minimale d\'un stage en mois', '2025-05-21 18:02:54', '2025-05-21 18:02:54'),
(5, 'nombre_max_etudiants_entreprise', '5', 'Nombre maximum d\'étudiants par entreprise', '2025-05-21 18:02:54', '2025-05-21 18:02:54'),
(6, 'app_name', 'Gestion des stages', 'Nom de l\'application', '2025-05-21 19:39:08', '2025-05-21 19:39:08'),
(7, 'dashboard_refresh_rate', '30', 'Taux de rafraîchissement du tableau de bord en secondes', '2025-05-21 19:39:08', '2025-05-21 19:39:08'),
(8, 'show_recent_activities', 'true', 'Afficher les activités récentes', '2025-05-21 19:39:08', '2025-05-21 19:39:08'),
(9, 'max_activities_displayed', '5', 'Nombre maximal d\'activités affichées', '2025-05-21 19:39:08', '2025-05-21 19:39:08'),
(10, 'duree_stage_min', '45', 'Durée minimale de stage en jours', '2025-05-21 19:43:22', '2025-05-21 19:43:22'),
(11, 'duree_stage_max', '90', 'Durée maximale de stage en jours', '2025-05-21 19:43:22', '2025-05-21 19:43:22'),
(12, 'delai_validation_convention', '7', 'Délai de validation d\'une convention en jours', '2025-05-21 19:43:22', '2025-05-21 19:43:22'),
(13, 'rapport_obligatoire', 'true', 'Rapport de stage obligatoire', '2025-05-21 19:43:22', '2025-05-21 19:43:22'),
(14, 'soutenance_obligatoire', 'true', 'Soutenance obligatoire', '2025-05-21 19:43:22', '2025-05-21 19:43:22'),
(15, 'note_passage_min', '12', 'Note minimale pour valider le stage', '2025-05-21 19:43:22', '2025-05-21 19:43:22');

-- --------------------------------------------------------

--
-- Structure de la table `propositions_stages`
--

DROP TABLE IF EXISTS `propositions_stages`;
CREATE TABLE IF NOT EXISTS `propositions_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entreprise_nom` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirements` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `filiere_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_publication` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `statut` enum('active','expiree','pourvue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `entreprise_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `filiere_id` (`filiere_id`),
  KEY `fk_propositions_entreprise` (`entreprise_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `propositions_stages`
--

INSERT INTO `propositions_stages` (`id`, `entreprise_nom`, `titre`, `location`, `description`, `requirements`, `duration`, `filiere_id`, `created_at`, `updated_at`, `date_publication`, `statut`, `entreprise_id`) VALUES
(1, 'SONATEL', 'Développeur Full Stack', 'Dakar, Sénégal', 'Stage de fin d\'études pour le développement d\'applications web modernes.', 'React, Node.js, MongoDB', '6 mois', 2, '2025-05-21 18:02:53', '2025-05-21 18:02:53', '2025-05-21 19:30:11', 'active', NULL),
(2, 'FREE', 'Ingénieur Réseau', 'Dakar, Sénégal', 'Stage dans le domaine des réseaux et télécommunications.', 'Cisco, Réseaux IP, Administration système', '4 mois', 1, '2025-05-21 18:02:53', '2025-05-21 18:02:53', '2025-05-21 19:30:11', 'active', NULL),
(3, 'SGBS', 'Analyste de données', 'Dakar, Sénégal', 'Stage d\'analyse de données financières et création de tableaux de bord.', 'Excel, Power BI, SQL', '5 mois', 3, '2025-05-21 18:02:53', '2025-05-21 18:02:53', '2025-05-21 19:30:11', 'active', NULL),
(4, 'EXPRESSO', 'Développeur Mobile', 'Dakar, Sénégal', 'Développement d\'applications mobiles pour les services clients.', 'Flutter, Dart, Firebase', '4 mois', 2, '2025-05-21 18:02:53', '2025-05-21 18:02:53', '2025-05-21 19:30:11', 'active', NULL),
(5, 'GCE', 'Ingénieur en Automatisme', 'Dakar, Sénégal', 'Stage sur les systèmes automatisés industriels.', 'PLC, SCADA, Automatisme industriel', '6 mois', 4, '2025-05-21 18:02:53', '2025-05-21 18:02:53', '2025-05-21 19:30:11', 'active', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `stages`
--

DROP TABLE IF EXISTS `stages`;
CREATE TABLE IF NOT EXISTS `stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `etudiant_id` int NOT NULL,
  `entreprise_id` int NOT NULL,
  `maitre_stage_id` int NOT NULL,
  `maitre_memoire_id` int NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `theme_memoire` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('en_cours','termine','abandonne') COLLATE utf8mb4_unicode_ci DEFAULT 'en_cours',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stages_etudiant` (`etudiant_id`),
  KEY `idx_stages_entreprise` (`entreprise_id`),
  KEY `idx_stages_maitre_stage` (`maitre_stage_id`),
  KEY `idx_stages_maitre_memoire` (`maitre_memoire_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `stages`
--

INSERT INTO `stages` (`id`, `etudiant_id`, `entreprise_id`, `maitre_stage_id`, `maitre_memoire_id`, `date_debut`, `date_fin`, `theme_memoire`, `statut`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 1, 1, '2025-03-15', '2025-05-16', 'Bon juste un theme inh!! ', 'en_cours', '2025-05-17 21:15:04', '2025-05-17 21:15:04');

-- --------------------------------------------------------

--
-- Structure de la table `statistiques_stages`
--

DROP TABLE IF EXISTS `statistiques_stages`;
CREATE TABLE IF NOT EXISTS `statistiques_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `periode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nb_etudiants_total` int NOT NULL DEFAULT '0',
  `nb_stages_en_cours` int NOT NULL DEFAULT '0',
  `nb_stages_termines` int NOT NULL DEFAULT '0',
  `nb_stages_abandonnes` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `periode` (`periode`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `statistiques_stages`
--

INSERT INTO `statistiques_stages` (`id`, `periode`, `nb_etudiants_total`, `nb_stages_en_cours`, `nb_stages_termines`, `nb_stages_abandonnes`, `created_at`, `updated_at`) VALUES
(1, '2025-05', 72, 54, 12, 6, '2025-05-21 18:02:53', '2025-05-21 18:02:53'),
(2, '2025-04', 70, 50, 15, 5, '2025-05-21 18:02:53', '2025-05-21 18:02:53'),
(3, '2025-03', 68, 48, 12, 8, '2025-05-21 18:02:53', '2025-05-21 18:02:53'),
(4, '2025-02', 65, 40, 20, 5, '2025-05-21 18:02:53', '2025-05-21 18:02:53'),
(5, '2025-01', 60, 35, 18, 7, '2025-05-21 18:02:53', '2025-05-21 18:02:53');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matricule` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filiere_id` int DEFAULT NULL,
  `role` enum('etudiant','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'etudiant',
  `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `matricule` (`matricule`),
  KEY `idx_utilisateurs_filiere` (`filiere_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `telephone`, `email`, `matricule`, `filiere_id`, `role`, `mot_de_passe`, `whatsapp`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'Système', '00000000', 'admin@isi.edu', 'ADMIN001', NULL, 'admin', '$2y$10$8D/6wS5QMQ9ZZD.19lI33.RH7KzDrAHKQPCYrBC7chA9SyZZLfgPi', NULL, '2025-05-15 15:18:24', '2025-05-15 15:18:24'),
(2, 'Dupont', 'Jean', '0123456789', 'jean.dupont@example.com', 'MAT123456', 1, 'etudiant', '$2b$10$LwQqO3wNvNKXztJt.RkCO.0KxfNmYSE.OFf1q6R3m9WjwDvX4DnRa', NULL, '2025-05-16 18:44:35', '2025-05-16 18:44:35'),
(3, 'AJASSOHO', 'Arès', '61000345', 'ares@gmail.com', '64036STI45', 8, 'etudiant', '$2b$10$d05M9EkGciqv9zHG5xkUvefwJ8UWQo6uuN8KbmHawlc8z9bhOuOoq', NULL, '2025-05-16 19:31:22', '2025-05-16 19:31:22'),
(5, 'ADMIN', 'Test', '+22952902189', 'ares09@gmail.com', '00000000', 4, 'admin', 'admin2025', '99789078', '2025-05-21 11:49:14', '2025-05-21 11:49:14');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_activites_recentes`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_activites_recentes`;
CREATE TABLE IF NOT EXISTS `vue_activites_recentes` (
`created_at` timestamp
,`date_activite` datetime
,`description` varchar(255)
,`id` int
,`type_activite` varchar(50)
,`updated_at` timestamp
,`user_id` int
,`valeur` int
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_etudiants`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_etudiants`;
CREATE TABLE IF NOT EXISTS `vue_etudiants` (
`email` varchar(100)
,`entreprise` varchar(150)
,`filiere` varchar(100)
,`filiere_id` int
,`id` int
,`matricule` varchar(20)
,`nom` varchar(100)
,`prenom` varchar(100)
,`stage_id` int
,`stage_statut` enum('en_cours','termine','abandonne')
,`telephone` varchar(20)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_stages_par_entreprise`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_stages_par_entreprise`;
CREATE TABLE IF NOT EXISTS `vue_stages_par_entreprise` (
`count` bigint
,`entreprise` varchar(150)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_stats_par_filiere`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_stats_par_filiere`;
CREATE TABLE IF NOT EXISTS `vue_stats_par_filiere` (
`filiere` varchar(100)
,`id` int
,`nb_etudiants` bigint
,`nb_stages_requis` int
,`pourcentage_reussite` decimal(27,4)
,`stages_trouves` bigint
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_stats_par_statut`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_stats_par_statut`;
CREATE TABLE IF NOT EXISTS `vue_stats_par_statut` (
`count` bigint
,`statut` varchar(10)
);

-- --------------------------------------------------------

--
-- Structure de la vue `dashboard_activites`
--
DROP TABLE IF EXISTS `dashboard_activites`;

DROP VIEW IF EXISTS `dashboard_activites`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `dashboard_activites`  AS SELECT `activites_recentes`.`id` AS `id`, `activites_recentes`.`type_activite` AS `type_activite`, `activites_recentes`.`description` AS `description`, `activites_recentes`.`valeur` AS `valeur`, `activites_recentes`.`date_activite` AS `date_activite`, `activites_recentes`.`created_at` AS `created_at`, `activites_recentes`.`updated_at` AS `updated_at` FROM `activites_recentes` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_activites_recentes`
--
DROP TABLE IF EXISTS `vue_activites_recentes`;

DROP VIEW IF EXISTS `vue_activites_recentes`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_activites_recentes`  AS SELECT `activites_recentes`.`id` AS `id`, ifnull(`activites_recentes`.`type`,`activites_recentes`.`type_activite`) AS `type_activite`, `activites_recentes`.`description` AS `description`, `activites_recentes`.`valeur` AS `valeur`, ifnull(`activites_recentes`.`date_creation`,`activites_recentes`.`date_activite`) AS `date_activite`, `activites_recentes`.`created_at` AS `created_at`, `activites_recentes`.`updated_at` AS `updated_at`, `activites_recentes`.`user_id` AS `user_id` FROM `activites_recentes` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_etudiants`
--
DROP TABLE IF EXISTS `vue_etudiants`;

DROP VIEW IF EXISTS `vue_etudiants`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_etudiants`  AS SELECT `u`.`id` AS `id`, `u`.`matricule` AS `matricule`, `u`.`nom` AS `nom`, `u`.`prenom` AS `prenom`, `u`.`email` AS `email`, `u`.`telephone` AS `telephone`, `u`.`filiere_id` AS `filiere_id`, `f`.`nom` AS `filiere`, `s`.`id` AS `stage_id`, `s`.`statut` AS `stage_statut`, `e`.`nom` AS `entreprise` FROM (((`utilisateurs` `u` left join `filieres` `f` on((`u`.`filiere_id` = `f`.`id`))) left join `stages` `s` on((`s`.`etudiant_id` = `u`.`id`))) left join `entreprises` `e` on((`s`.`entreprise_id` = `e`.`id`))) WHERE (`u`.`role` = 'etudiant') ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_stages_par_entreprise`
--
DROP TABLE IF EXISTS `vue_stages_par_entreprise`;

DROP VIEW IF EXISTS `vue_stages_par_entreprise`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_stages_par_entreprise`  AS SELECT `e`.`nom` AS `entreprise`, count(`s`.`id`) AS `count` FROM (`stages` `s` join `entreprises` `e` on((`s`.`entreprise_id` = `e`.`id`))) GROUP BY `e`.`nom` ORDER BY `count` DESC LIMIT 0, 5 ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_stats_par_filiere`
--
DROP TABLE IF EXISTS `vue_stats_par_filiere`;

DROP VIEW IF EXISTS `vue_stats_par_filiere`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_stats_par_filiere`  AS SELECT `f`.`id` AS `id`, `f`.`nom` AS `filiere`, count(`u`.`id`) AS `nb_etudiants`, count(`s`.`id`) AS `stages_trouves`, `pf`.`nb_stages_requis` AS `nb_stages_requis`, ((count(`s`.`id`) / count(`u`.`id`)) * 100) AS `pourcentage_reussite` FROM (((`filieres` `f` left join `utilisateurs` `u` on(((`u`.`filiere_id` = `f`.`id`) and (`u`.`role` = 'etudiant')))) left join `stages` `s` on((`s`.`etudiant_id` = `u`.`id`))) left join `parametres_filieres` `pf` on((`pf`.`filiere_id` = `f`.`id`))) GROUP BY `f`.`id` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_stats_par_statut`
--
DROP TABLE IF EXISTS `vue_stats_par_statut`;

DROP VIEW IF EXISTS `vue_stats_par_statut`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_stats_par_statut`  AS SELECT ifnull(`s`.`statut`,'non_defini') AS `statut`, count(`u`.`id`) AS `count` FROM (`utilisateurs` `u` left join `stages` `s` on((`s`.`etudiant_id` = `u`.`id`))) WHERE (`u`.`role` = 'etudiant') GROUP BY ifnull(`s`.`statut`,'non_defini') ;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `activites_recentes`
--
ALTER TABLE `activites_recentes`
  ADD CONSTRAINT `activites_recentes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`stage_id`) REFERENCES `stages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`evaluateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `maitres_stage`
--
ALTER TABLE `maitres_stage`
  ADD CONSTRAINT `maitres_stage_ibfk_1` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `parametres_filieres`
--
ALTER TABLE `parametres_filieres`
  ADD CONSTRAINT `parametres_filieres_ibfk_1` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `propositions_stages`
--
ALTER TABLE `propositions_stages`
  ADD CONSTRAINT `fk_propositions_entreprise` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `propositions_stages_ibfk_1` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `stages`
--
ALTER TABLE `stages`
  ADD CONSTRAINT `stages_ibfk_1` FOREIGN KEY (`etudiant_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stages_ibfk_2` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stages_ibfk_3` FOREIGN KEY (`maitre_stage_id`) REFERENCES `maitres_stage` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stages_ibfk_4` FOREIGN KEY (`maitre_memoire_id`) REFERENCES `maitres_memoire` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
