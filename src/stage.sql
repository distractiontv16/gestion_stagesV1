-- Table parametres_filieres
CREATE TABLE IF NOT EXISTS `parametres_filieres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filiere_id` int NOT NULL,
  `nb_etudiants` int NOT NULL DEFAULT '0',
  `nb_stages_requis` int NOT NULL DEFAULT '0',
  `pourcentage_reussite` decimal(5,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `filiere_id` (`filiere_id`),
  CONSTRAINT `parametres_filieres_ibfk_1` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de données initiales pour parametres_filieres
INSERT INTO `parametres_filieres` (`filiere_id`, `nb_etudiants`, `nb_stages_requis`, `pourcentage_reussite`) VALUES
(1, 25, 18, 72.00), -- GEI/EE
(2, 30, 20, 66.67), -- GEI/IT
(3, 22, 15, 68.18), -- GE/ER
(4, 18, 12, 66.67), -- GMP
(5, 20, 15, 75.00), -- MSY/MI
(6, 15, 10, 66.67), -- ER/SE
(7, 24, 18, 75.00), -- GC/A
(8, 22, 17, 77.27), -- GC/B
(9, 16, 12, 75.00), -- MSY/MA
(10, 20, 15, 75.00); -- GE/FC

-- Table propositions_stages
CREATE TABLE IF NOT EXISTS `propositions_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirements` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filiere_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `filiere_id` (`filiere_id`),
  CONSTRAINT `propositions_stages_ibfk_1` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de données initiales pour propositions_stages
INSERT INTO `propositions_stages` (`company`, `position`, `location`, `description`, `requirements`, `duration`, `filiere_id`) VALUES
('SONATEL', 'Développeur Full Stack', 'Dakar, Sénégal', 'Stage de fin d\'études pour le développement d\'applications web modernes.', 'React, Node.js, MongoDB', '6 mois', 2),
('FREE', 'Ingénieur Réseau', 'Dakar, Sénégal', 'Stage dans le domaine des réseaux et télécommunications.', 'Cisco, Réseaux IP, Administration système', '4 mois', 1),
('SGBS', 'Analyste de données', 'Dakar, Sénégal', 'Stage d\'analyse de données financières et création de tableaux de bord.', 'Excel, Power BI, SQL', '5 mois', 3),
('EXPRESSO', 'Développeur Mobile', 'Dakar, Sénégal', 'Développement d\'applications mobiles pour les services clients.', 'Flutter, Dart, Firebase', '4 mois', 2),
('GCE', 'Ingénieur en Automatisme', 'Dakar, Sénégal', 'Stage sur les systèmes automatisés industriels.', 'PLC, SCADA, Automatisme industriel', '6 mois', 4);

-- Table statistiques_stages
CREATE TABLE IF NOT EXISTS `statistiques_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `periode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nb_etudiants_total` int NOT NULL DEFAULT '0',
  `nb_stages_en_cours` int NOT NULL DEFAULT '0',
  `nb_stages_termines` int NOT NULL DEFAULT '0',
  `nb_stages_abandonnes` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `periode` (`periode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de données initiales pour statistiques_stages
INSERT INTO `statistiques_stages` (`periode`, `nb_etudiants_total`, `nb_stages_en_cours`, `nb_stages_termines`, `nb_stages_abandonnes`) VALUES
('2025-05', 72, 54, 12, 6),
('2025-04', 70, 50, 15, 5),
('2025-03', 68, 48, 12, 8),
('2025-02', 65, 40, 20, 5),
('2025-01', 60, 35, 18, 7);

-- Table activites_recentes
CREATE TABLE IF NOT EXISTS `activites_recentes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_activite` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valeur` int NOT NULL DEFAULT '0',
  `date_activite` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de données initiales pour activites_recentes
INSERT INTO `activites_recentes` (`type_activite`, `description`, `valeur`, `date_activite`) VALUES
('inscription_etudiants', 'Nouveaux étudiants inscrits', 8, CURRENT_DATE() - INTERVAL 7 DAY),
('propositions_stages', 'Nouvelles propositions de stages', 3, CURRENT_DATE() - INTERVAL 5 DAY),
('conventions_signees', 'Nouvelles conventions signées', 5, CURRENT_DATE() - INTERVAL 3 DAY),
('memoires_soumis', 'Mémoires soumis pour évaluation', 4, CURRENT_DATE() - INTERVAL 1 DAY),
('soutenances_programmees', 'Soutenances programmées', 6, CURRENT_DATE());

-- Vue pour statistiques de stages par entreprise
CREATE OR REPLACE VIEW `vue_stages_par_entreprise` AS
SELECT 
    e.nom AS entreprise, 
    COUNT(s.id) AS count 
FROM 
    stages s
JOIN 
    entreprises e ON s.entreprise_id = e.id 
GROUP BY 
    e.nom
ORDER BY 
    count DESC
LIMIT 5;

-- Table pour les paramètres système globaux
CREATE TABLE IF NOT EXISTS `parametres_systeme` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valeur` text COLLATE utf8mb4_unicode_ci,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de paramètres système courants
INSERT INTO `parametres_systeme` (`nom`, `valeur`, `description`) VALUES
('date_debut_stages', '2025-06-01', 'Date de début officielle des stages'),
('date_fin_stages', '2025-12-31', 'Date de fin officielle des stages'),
('date_limite_soumission', '2025-06-30', 'Date limite de soumission des informations de stage'),
('duree_min_stage', '4', 'Durée minimale d\'un stage en mois'),
('nombre_max_etudiants_entreprise', '5', 'Nombre maximum d\'étudiants par entreprise');