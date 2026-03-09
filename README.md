# ✨ Modern Portfolio — Pierre Bouteman

![Static](https://img.shields.io/badge/Site-Statique-7c3aed?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-0ea5e9?style=for-the-badge)
![i18n](https://img.shields.io/badge/Langues-FR%20%2F%20EN-22c55e?style=for-the-badge)
![Realtime](https://img.shields.io/badge/Realtime-Supabase-FF6B6B?style=for-the-badge)

Portfolio personnel ultra-moderne avec identité visuelle futuriste, intégration temps réel (GitHub & Discord) et système de gestion dynamique.

## 🚀 Features

- **Real-time Availability** : Synchronisation instantanée du statut via Discord -> Supabase -> Portfolio.
- **Terminal Loader** : Animation de chargement immersive simulant un scan système.
- **High Performance Mode** : Optimisation pour les anciens PCs (désactive le mesh background et les animations lourdes).
- **Ctrl+K Search** : Recherche rapide de projets par titre ou technologie.
- **GitHub Stats Live** : Affichage en temps réel des statistiques globales et par projet (stars, forks).
- **Contact Form Securisé** : Envoi de messages via Webhook Discord avec injection de secrets via GitHub Actions.

## 🧱 Stack technique

- **HTML5 & CSS3** (Vanilla, Glassmorphism, CSS Variables)
- **JavaScript ES Modules** (Pas de framework frontend)
- **Supabase** (Base de données temps réel & Realtime engine)
- **Node.js** (Bot de synchronisation Discord)
- **Lanyard API** (Statut Discord général)
- **GitHub API** (Statistiques des repositories)

## 📂 Architecture

```text
modern-portfolio/
├── .github/workflows/      # Automatisations GitHub (Injection secrets & Deploy)
├── bot/                    # Bot Node.js (Sync Discord -> Supabase)
│   ├── index.js
│   └── package.json
├── assets/                 # Logo SVG, Favicon, Images
├── js/
│   ├── app.js              # Logique métier & UI Real-time
│   ├── i18n.js             # Internationalisation (FR/EN)
│   ├── config.js           # Configuration initiale (Public + Secrets injectés)
│   └── particles.js        # Moteur de particules
└── index.html              # Point d'entrée principal
```

## 🤖 Setup du Bot (Temps Réel)

Le bot se trouve dans le dossier `/bot`. Il écoute un salon Discord spécifique et met à jour Supabase instantanément.

1. **Installation** : `cd bot && npm install`
2. **Configuration** : Créer un fichier `.env` basé sur `.env.example`.
3. **Lancement** : `npm start` (ou via un gestionnaire comme PM2).

### Commandes Discord supportées
- `dispo` ou `available` : Passe le statut en vert.
- `indisponible` ou `occupé` : Passe le statut en rouge.
- `[nombre]` (ex: `3`) : Met à jour le nombre de projets sans changer la disponibilité.
- Combinaisons possibles : `dispo 2` ou `occupé 5`.

## ⚙️ Configuration GitHub Secrets

Seul le Webhook Discord reste un secret injecté au build pour la sécurité :

| Secret | Description |
| :--- | :--- |
| `DISCORD_WEBHOOK` | L'URL du webhook pour le formulaire de contact. |

*Note: L'URL Supabase et la clé Anon sont publiques par design pour permettre la lecture en temps réel.*

## 📄 Licence

© 2026 Pierre Bouteman. Tous droits réservés.
