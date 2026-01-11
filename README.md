# MemeGale Front 🌪️

Frontend de l'application **MemeGale**, développé avec **Angular 19** et **TailwindCSS**.
Ce projet permet aux utilisateurs de partager, liker et commenter des mèmes dans une interface moderne et réactive.

## 🚀 Fonctionnalités Clés

- **Authentification** : Connexion/Inscription (Email + Google OAuth).
- **Galerie de Mèmes** : Infinite Scroll, Filtres (Popularité, Date, Alphabétique), Recherche avec Meilisearch.
- **Interactions** : Likes avec animations (WebSockets temps réel), partages.
- **Profil Utilisateur** : Statistiques (Likes, Vues), Édition de profil (Avatar), Dark Mode.
- **UX/UI** : Skeleton loaders, Responsive Design, Thèmes dynamiques.

## 🛠️ Stack Technique

- **Framework** : Angular 19 (Standalone Components, Signals)
- **Styling** : TailwindCSS + CSS Variables (Dark mode)
- **State Management** : RxJS + Angular Signals
- **Backend** : Directus (CMS Headless)
- **Temps Réel** : WebSockets (Directus)

## 📦 Installation

### Prérequis

- Node.js (v18+)
- npm ou bun
- Angular CLI (`npm install -g @angular/cli`)

### Étapes

1. Cloner le projet :

   ```bash
   git clone <url_repo>
   cd meme-gale-front
   ```

2. Installer les dépendances :

   ```bash
   npm install
   ```

3. Configurer l'environnement :
   Vérifiez `src/environments/environment.ts` pour l'URL du backend Directus (par défaut `http://localhost:8055`).

## 🏃‍♂️ Démarrage

Lancer le serveur de développement :

```bash
ng serve
```

Accédez à l'application sur `http://localhost:4200`.

## 🏗️ Structure du Projet

- `src/app/pages` : Composants de pages (Gallery, Login, Profile, etc.)
- `src/app/shared` :
  - `components` : Composants réutilisables (Navbar, Cards, Modals)
  - `services` : Logique métier (Auth, Meme, WebSocket)
  - `guards` : Protection des routes
  - `interfaces` : Types TypeScript
