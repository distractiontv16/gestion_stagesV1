# Plateforme de Gestion des Stages - ISI

## Description du Projet

Ce projet a pour objectif de moderniser la gestion des stages à l'institut en remplaçant l'utilisation de fichiers Excel par une plateforme en ligne complète et efficace. Cette solution permettra une gestion centralisée des informations relatives aux stages des étudiants, facilitant ainsi le suivi pour les administrateurs et simplifiant les démarches pour les étudiants.

## Technologies Utilisées

- **Frontend** : HTML, CSS, JavaScript avec Vite.js
- **Backend** : Node.js avec Express.js
- **Base de Données** : MySQL (via WampServer)

## Fonctionnalités Principales

### Pour les Étudiants

1. **Inscription et Authentification**
   - Création de compte avec les informations personnelles :
     - Nom et prénom
     - Numéro WhatsApp
     - Filière
     - Matricule

2. **Tableau de Bord Étudiant**
   - Accès à leurs informations personnelles
   - Déconnexion
   - Formulaire de renseignement sur le stage
   - Visualisation des notifications

3. **Gestion des Informations de Stage** (formulaire en 4 étapes)
   - **Onglet 1 : Informations sur l'Entreprise**
     - Département
     - Commune
     - Quartier
     - Nom de l'entreprise
     - Date de début de stage
     - Date de fin de stage
   
   - **Onglet 2 : Informations sur l'Étudiant**
     - Filière/Spécialité (rempli automatiquement)
     - Prénom (rempli automatiquement)
     - Nom (rempli automatiquement)
     - Numéro de téléphone (rempli automatiquement)
     - Thème de fin d'études
   
   - **Onglet 3 : Informations sur le Maître de Stage**
     - Nom
     - Prénom
     - Numéro de téléphone
     - Email
     - Fonction/Poste
   
   - **Onglet 4 : Informations sur le Maître de Mémoire**
     - Nom et prénom
     - Numéro de téléphone
     - Email
     - Statut (Permanent ou Vacataire)

### Pour les Administrateurs

1. **Authentification Sécurisée**
   - Connexion via matricule et mot de passe

2. **Tableau de Bord Administrateur**
   - Statistiques sur les soumissions par filière
   - Vue d'ensemble des stages en cours
   - Indicateurs de performance

3. **Gestion des Étudiants**
   - Liste complète des étudiants et leurs informations de stage
   - Filtres dynamiques (par maître de mémoire, filière, entreprise, commune, quartier, etc.)
   - Affichage en temps réel des informations soumises par les étudiants

4. **Système d'Évaluation**
   - Attribution de notes aux étudiants
   - Ajout d'observations et commentaires
   - Suivi des performances

## Structure de la Base de Données

```
├── utilisateurs
│   ├── id
│   ├── nom
│   ├── prenom
│   ├── telephone
│   ├── email
│   ├── matricule
│   ├── filiere_id
│   ├── role (étudiant/admin)
│   └── mot_de_passe

├── stages
│   ├── id
│   ├── etudiant_id
│   ├── entreprise_id
│   ├── date_debut
│   ├── date_fin
│   └── theme_memoire

├── entreprises
│   ├── id
│   ├── nom
│   ├── departement
│   ├── commune
│   └── quartier

├── maitres_stage
│   ├── id
│   ├── nom
│   ├── prenom
│   ├── telephone
│   ├── email
│   ├── fonction
│   └── entreprise_id

├── maitres_memoire
│   ├── id
│   ├── nom
│   ├── prenom
│   ├── telephone
│   ├── email
│   └── statut (permanent/vacataire)

├── evaluations
│   ├── id
│   ├── stage_id
│   ├── note
│   ├── observation
│   └── date_evaluation

├── filieres
│   ├── id
│   └── nom
```


## API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription étudiant

### Étudiants
- `GET /api/students` - Récupérer tous les étudiants
- `GET /api/students/:id` - Récupérer un étudiant spécifique
- `PUT /api/students/:id` - Mettre à jour les informations d'un étudiant

### Stages
- `POST /api/internships` - Créer une nouvelle entrée de stage
- `GET /api/internships` - Récupérer tous les stages
- `GET /api/internships/:id` - Récupérer un stage spécifique
- `PUT /api/internships/:id` - Mettre à jour un stage

### Administration
- `GET /api/admin/dashboard` - Statistiques pour le tableau de bord
- `POST /api/admin/evaluations` - Ajouter une évaluation
- `PUT /api/admin/evaluations/:id` - Modifier une évaluation

