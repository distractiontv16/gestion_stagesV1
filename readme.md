# Plateforme de Gestion des Stages - INSTI

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




## Résumé du travail effectué

Nous avons implémenté un système d'authentification backend complet pour la plateforme de gestion des stages avec les fonctionnalités suivantes :

1. **Système d'authentification** :
   - Inscription des utilisateurs (`/api/auth/register`)
   - Connexion des utilisateurs (`/api/auth/login`) 
   - Récupération des informations de l'utilisateur courant (`/api/auth/me`)

2. **Middleware d'authentification** :
   - Protection des routes avec vérification des tokens JWT
   - Middleware pour les routes réservées aux administrateurs

3. **Configuration de la base de données** :
   - Connection pool avec mysql2
   - Gestion des erreurs appropriée

4. **Structure du projet** :
   - Routes organisées en modules séparés
   - Module de configuration pour la connexion à la base de données
   - Middleware pour la protection des routes

Le serveur est maintenant fonctionnel et prêt à être intégré avec le frontend. Les utilisateurs peuvent s'inscrire, se connecter et accéder aux routes protégées.

Pour tester ces endpoints, vous pouvez utiliser Postman ou Thunder Client dans VS Code avec les routes suivantes :
- `POST http://localhost:3000/api/auth/register` (avec les données utilisateur)
- `POST http://localhost:3000/api/auth/login` (avec matricule et mot de passe)
- `GET http://localhost:3000/api/auth/me` (avec l'en-tête d'autorisation)

La route test protégée (`GET http://localhost:3000/api/test`) démontre comment sécuriser les endpoints qui ne devraient être accessibles qu'aux utilisateurs authentifiés.




C'est bien que le déploiement principal ait réussi ! Cette erreur 404 "NOT_FOUND" que Vercel affiche signifie que l'URL à laquelle vous essayez d'accéder n'est pas reconnue, ni comme une route de votre API backend, ni comme une page de votre application frontend.

Plusieurs raisons peuvent causer cela :

1.  **Lien incorrect :** L'URL du lien sur votre page de connexion étudiant qui pointe vers la page de connexion admin est peut-être erronée.
2.  **Route Frontend manquante :** Si la page de connexion admin est une page de votre application React (ce qui est probable), il se peut que la route correspondante ne soit pas correctement définie dans votre routeur React (par exemple, React Router).
3.  **Route Backend incorrecte (moins probable pour une page) :** Si le lien pointe directement vers une URL d'API qui devrait servir une page HTML (ce qui est inhabituel pour les API), cette route backend n'existe peut-être pas.
4.  **Configuration de `vercel.json` :** Bien que votre `vercel.json` semble correct pour un cas standard, une URL très spécifique ou mal formée pourrait ne pas être correctement acheminée.

Pour que je puisse vous aider à diagnostiquer :

1.  **Quelle est l'URL exacte** dans la barre d'adresse de votre navigateur lorsque vous voyez cette erreur 404 ?
2.  **Quel est le chemin (path) que vous avez défini dans votre code React (React Router) pour la page de connexion administrateur ?**
3.  Pourriez-vous me montrer le code du lien sur votre page de connexion étudiant qui est censé rediriger vers la page de connexion admin ?

En attendant, je vais essayer de chercher comment vos routes frontend sont définies. Je vais chercher des fichiers comme `App.js`, `App.tsx`, ou des fichiers contenant `Router` ou `Route`.


Search files...
Les résultats de la recherche montrent votre configuration de routage dans `src/App.tsx`.

```typescript
// src/App.tsx
// ... autres imports
const LoginPage = lazy(() => import('./pages/login'));
const RegisterPage = lazy(() => import('./pages/register'));
const AdminLoginPage = lazy(() => import('./pages/admin-login')); // <--- Page de connexion Admin

// ... autres pages

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} /> {/* <--- Route pour la connexion Admin */}
          
          {/* Routes étudiants */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          
          {/* Routes admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
```

D'après ce code :

1.  Vous avez bien une page dédiée à la connexion administrateur : `AdminLoginPage`, importée depuis `'./pages/admin-login'`.
2.  La route frontend pour cette page est correctement définie : `<Route path="/admin/login" element={<AdminLoginPage />} />`.

Cela signifie que si vous accédez à `VOTRE_DOMAINE_VERCEL/admin/login`, cela *devrait* fonctionner.

**La cause la plus probable de l'erreur 404 est donc un lien incorrect sur votre page de connexion étudiant.**

Pourriez-vous me montrer le code du composant de votre page de connexion étudiant (probablement `src/pages/login.tsx` ou un composant similaire comme `src/components/ui/login-form.tsx` qui est utilisé dans la page `/login`) ? Plus précisément, je voudrais voir comment le lien vers la page de connexion admin est créé (par exemple, avec une balise `<a>` ou un composant `<Link>` de `react-router-dom`).

Si le lien est, par exemple :

*   `href="admin/login"` (relatif sans `/` au début) : il pourrait essayer de naviguer vers `VOTRE_DOMAINE_VERCEL/login/admin/login` si vous êtes déjà sur la page `/login`, ce qui est incorrect.
*   `href="/admin-login"` (avec un tiret au lieu d'un slash) : ce serait aussi incorrect car votre route est `/admin/login`.

Le lien correct devrait être `href="/admin/login"` ou, si vous utilisez `react-router-dom`, `<Link to="/admin/login">`.

En attendant que vous me fournissiez le code du lien, je vais examiner le fichier `src/components/ui/login-form.tsx` qui semble être votre formulaire de connexion.


Read file: src/components/ui/login-form.tsx
J'ai trouvé le lien dans `src/components/ui/login-form.tsx` !

```typescript
// ...
            <div className="text-center text-gray-600 text-sm mt-2">
              <a href="/admin/login" className="text-blue-600 font-medium hover:underline">
                Accès administrateur
              </a>
            </div>
// ...
```

Le lien utilise `href="/admin/login"`. **Ceci est correct !** Il correspond exactement à la route que vous avez définie dans `src/App.tsx` pour `AdminLoginPage`.

Puisque le lien lui-même est correct et que la route frontend `/admin/login` est définie, l'erreur 404 que Vercel vous montre est maintenant plus surprenante.

Voici quelques pistes à explorer :

1.  **Cache du navigateur ou de Vercel :**
    *   Essayez d'accéder à la page en navigation privée dans votre navigateur pour éliminer un problème de cache local.
    *   Il y a parfois un léger délai ou un cache au niveau de Vercel après un nouveau déploiement. Attendez quelques minutes et réessayez.
    *   Vous pouvez aussi essayer de forcer un "hard refresh" dans votre navigateur (Ctrl+Shift+R ou Cmd+Shift+R).

2.  **Problème avec le composant `AdminLoginPage` lui-même :**
    *   Y a-t-il une erreur *dans* le composant `AdminLoginPage` (situé dans `./pages/admin-login.tsx` ou un nom similaire) qui pourrait l'empêcher de se rendre correctement ? Si le composant plante avant de s'afficher, cela pourrait théoriquement aboutir à une sorte de page d'erreur, bien que Vercel affiche généralement ses propres erreurs pour les plantages d'application.
    *   Vérifiez les logs de votre navigateur (console développeur) lorsque vous essayez d'accéder à `/admin/login` pour voir s'il y a des erreurs JavaScript.

3.  **Logs de build et de runtime sur Vercel :**
    *   Allez sur votre tableau de bord Vercel, sélectionnez votre projet, puis allez dans l'onglet "Deployments".
    *   Cliquez sur le déploiement le plus récent.
    *   Vérifiez les "Build Logs" pour toute erreur ou avertissement pendant la phase de construction.
    *   Vérifiez les "Runtime Logs" (ou "Functions Logs") pour toute erreur qui se produirait lorsque vous essayez d'accéder à la page. L'erreur 404 que vous voyez à l'écran devrait aussi apparaître ici, peut-être avec plus de contexte.

4.  **Structure de `vercel.json` et service des fichiers :**
    Votre `vercel.json` a cette route "catch-all" pour le frontend :
    ```json
    {
      "src": "/(.*)",
      "dest": "/dist/index.html"
    }
    ```
    Cela signifie que toute URL qui ne correspond pas à `/api/(.*)` ou `/assets/(.*)` devrait servir `index.html`, et React Router devrait alors prendre le relais pour afficher la bonne page. C'est le comportement standard et correct pour une SPA. Si `/admin/login` n'est pas intercepté par React Router, c'est étrange.

5.  **Nom de fichier exact de `AdminLoginPage` :**
    Dans `src/App.tsx`, vous avez `lazy(() => import('./pages/admin-login'));`. Assurez-vous que le fichier s'appelle bien `admin-login.tsx` (ou `.js` si c'est du JavaScript) et qu'il est directement dans le dossier `src/pages/`. La casse est importante.

**Action immédiate recommandée :**

Commencez par vérifier les **logs de runtime sur Vercel** lorsque vous tentez d'accéder à `VOTRE_DOMAINE_VERCEL/admin/login`. Cela nous donnera souvent l'indice le plus direct sur ce que Vercel essaie de faire avec cette URL.

Si vous pouviez partager l'URL exacte qui produit l'erreur 404 et tout message d'erreur pertinent des logs de Vercel ou de la console de votre navigateur, cela m'aiderait beaucoup.

Neons

Ares2040_BtC  aresgnimagnon0@gmail.com

PS C:\Users\ARES GNIMAGNON\Documents\REACT\gestion_stagesV1> 
ngrok http --url=robin-saving-instantly.ngrok-free.app 5173
PS C:\Users\ARES GNIMAGNON\Documents\REACT\gestion_stagesV1> 