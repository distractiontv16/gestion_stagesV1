# Guide d'installation et de configuration

Ce guide vous aidera à installer et configurer correctement l'application de gestion des stages.

## Prérequis

- Node.js (v14 ou supérieur)
- MySQL (v5.7 ou supérieur)
- npm (inclus avec Node.js)

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://votre-depot.git/gestion-stages.git
   cd gestion-stages
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   - Dupliquez le fichier `.env.example` en `.env`
   - Modifiez les valeurs selon votre configuration locale

4. Configuration de la base de données :
   - Créez une base de données MySQL nommée `gestion_stages`
   - Importez la structure de la base de données :
     ```bash
     mysql -u votre_utilisateur -p gestion_stages < sql/init_database.sql
     ```

## Configuration

### Configuration de la base de données

Les variables d'environnement pour la base de données sont :

```
DB_HOST=localhost
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=gestion_stages
```

### Configuration des JWT (authentification)

```
JWT_SECRET=une_chaine_secrete_longue_et_complexe
JWT_EXPIRE=30d
```

## Démarrage de l'application

### Mode développement

```bash
npm run dev
```

L'application sera accessible à l'adresse http://localhost:5173 et l'API à l'adresse http://localhost:3000.

### Mode production

```bash
npm run build
npm start
```

L'application sera accessible à l'adresse http://localhost:3000.

## Résolution des problèmes courants

### Erreur "Tables n'existent pas"

Si vous rencontrez des erreurs indiquant que certaines tables n'existent pas, vérifiez que vous avez bien importé le fichier SQL d'initialisation :

```bash
mysql -u votre_utilisateur -p gestion_stages < sql/init_database.sql
```

### Problèmes de connexion à la base de données

1. Vérifiez que MySQL est bien en cours d'exécution
2. Vérifiez les informations de connexion dans votre fichier `.env`
3. Assurez-vous que l'utilisateur MySQL a les permissions nécessaires

### Identifiants de test

- **Admin** : 
  - Matricule : ADMIN001
  - Mot de passe : admin123

## Structure du projet

- `src/` : Code source de l'application
  - `components/` : Composants React
  - `controllers/` : Contrôleurs de l'API
  - `middleware/` : Middleware (authentification, etc.)
  - `routes/` : Routes de l'API
  - `config/` : Configuration de l'application
- `sql/` : Scripts SQL
- `public/` : Fichiers statiques 


