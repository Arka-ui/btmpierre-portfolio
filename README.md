# ✨ Modern Portfolio — Pierre Bouteman

![Static](https://img.shields.io/badge/Site-Statique-7c3aed?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-0ea5e9?style=for-the-badge)
![i18n](https://img.shields.io/badge/Langues-FR%20%2F%20EN-22c55e?style=for-the-badge)

Portfolio personnel avec identité visuelle moderne, animation canvas, carte Discord en temps réel et système multilingue.

## 🚀 Features

- Hero full-screen avec effets visuels et typographie marquée
- Grille de projets + modale de détails
- Carte Discord live via Lanyard WebSocket
- i18n FR/EN avec persistance utilisateur (`localStorage`)
- Architecture front clean, sans framework

## 🧱 Stack technique

- **HTML5**
- **CSS3** (split en fichiers base/composants)
- **JavaScript ES Modules**
- **Canvas API** (particules)
- **Lanyard API** (présence Discord)

## 📂 Architecture

```text
modern-portfolio/
├── index.html
├── README.md
├── css/
│   ├── style.css          # Entrée CSS (imports)
│   ├── base.css           # Variables, reset, layout, nav, hero
│   └── components.css     # Cards, modale, sections, responsive
└── js/
    ├── main.js            # Entrée JS
    ├── app.js             # Logique principale UI
    ├── i18n.js            # Dictionnaires FR/EN
    └── particles.js       # Effet particules canvas
```

## ⚙️ Démarrage local

### 1) Serveur Python

```bash
cd modern-portfolio
python3 -m http.server 8000
```

Ouvre ensuite :

```text
http://127.0.0.1:8000
```

### 2) VS Code Live Server

- Ouvre le dossier dans VS Code
- Lance `index.html` avec l’extension Live Server

## 🌍 i18n (FR/EN)

- Langue par défaut : **français**
- Switch de langue dans le header : `FR` / `EN`
- Préférence persistée dans `localStorage` avec la clé `portfolio-lang`
- Traductions centralisées dans `js/i18n.js`

## 🎨 Personnalisation rapide

### Contenu

- Textes de page : `index.html`
- Dictionnaires de traduction : `js/i18n.js`
- Données projets : structure des cartes dans `index.html`

### UI & thème

- Variables de thème (`:root`) : `css/base.css`
- Composants visuels : `css/components.css`

### Discord

- Configuration & logique de la carte : `js/app.js`

## 🚢 Déploiement

Le projet est statique, il fonctionne directement sur :

- GitHub Pages
- Netlify
- Vercel (mode static)
- Nginx / Apache

## 🗺️ Roadmap (idées)

- [ ] Ajouter une vue mobile de navigation complète
- [ ] Ajouter une section expériences/formation
- [ ] Ajouter des tests visuels (Playwright)

## 📄 Licence

Pas de licence définie actuellement.
Si besoin, ajoute un fichier `LICENSE` (ex: MIT).
