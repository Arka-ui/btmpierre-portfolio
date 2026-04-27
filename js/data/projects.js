/**
 * @module data/projects
 * @description Case-study payloads for flagship projects. Fork-only file
 * (upstream has no equivalent). Each entry maps to a project carousel
 * `data-index` so projects-ui.js can call into project-modal.js when a card
 * is clicked.
 *
 * Schema:
 *   slug:      stable identifier — used in `#project=<slug>` deep links
 *   index:     position in the carousel (0-based, must match index.html)
 *   accent:    optional CSS color override for the modal hero strip
 *   icon:      bootstrap-icons class for the modal header
 *   metric:    short headline number ("9 mois", "5k stars", etc.)
 *   metricLabel: caption under the metric
 *   stack:     ordered tech list — rendered as pills in the modal
 *   links:     array of { type, label, href } — type is 'live' | 'github' | 'docs'
 *   content:   { fr, en } each with { tagline, problem, approach, lessons, screenshots }
 *              screenshots is an array of { src, alt } — falls back to a
 *              gradient placeholder if src is missing.
 */

export const FLAGSHIP_PROJECTS = [
    {
        slug: 'conferences-orientation',
        index: 0,
        accent: '#5B9DFF',
        icon: 'bi-calendar-check-fill',
        metric: '350+',
        stack: ['PHP 8', 'MySQL', 'PDF Export', 'Azuriom Auth'],
        links: [
            { type: 'live', label: 'Accès interne', href: 'https://conferencesorientationpdz.eclozionmc.ovh/' }
        ],
        content: {
            fr: {
                tagline: 'Plateforme d\'inscription et de suivi des conférences au lycée Paul Duez.',
                metricLabel: 'élèves inscrits par session',
                problem: 'Le lycée gérait les conférences d\'orientation à la main : tableurs partagés, présences cochées sur papier, exports PDF reconstruits chaque année. Résultat : créneaux saturés, doublons, et zéro visibilité pour l\'administration.',
                approach: 'Côté élève : interface d\'inscription avec créneaux temps-réel et limite par conférence. Côté enseignant : feuilles de présence numériques, validation rapide, export PDF par session. Côté admin : dashboard avec stats globales et exports CSV pour la suite.',
                lessons: 'Premier projet en charge complète d\'une commande "métier" : il a fallu négocier le scope avec les profs, prioriser les exports comme feature non-négociable, et accepter que le design soit utilitaire avant d\'être joli.',
                screenshots: []
            },
            en: {
                tagline: 'Registration and attendance platform for high-school orientation conferences.',
                metricLabel: 'students per session',
                problem: 'The school ran orientation conferences manually — shared spreadsheets, paper attendance, PDF exports rebuilt by hand every year. The result: oversold slots, duplicates, no admin-side visibility.',
                approach: 'Student side: real-time slot registration with per-conference caps. Teacher side: digital attendance, fast validation, per-session PDF export. Admin side: dashboard with global stats and CSV exports for downstream use.',
                lessons: 'First project where I owned a real "business" brief: scoping with the teachers, treating exports as a non-negotiable, and accepting the design had to be useful before it was pretty.',
                screenshots: []
            }
        }
    },
    {
        slug: 'nexaria',
        index: 1,
        accent: '#8DBAFF',
        icon: 'bi-box-seam-fill',
        metric: '24/7',
        stack: ['Paper API', 'Azuriom CMS', 'Velocity Proxy', 'PHP'],
        links: [
            { type: 'live', label: 'Voir le site', href: 'https://nexaria.netlib.re' }
        ],
        content: {
            fr: {
                tagline: 'Écosystème complet autour d\'un serveur Minecraft survie communautaire.',
                metricLabel: 'uptime visé sur le réseau',
                problem: 'Faire tourner un serveur Minecraft "à fond" demande bien plus qu\'un .jar et un VPS : il faut un site, une boutique, un classement, une communauté, des outils de modération, une CI pour les builds — sinon la communauté s\'évapore au premier downtime.',
                approach: 'Stack double : côté gameplay (Paper + plugins maison), côté web (Azuriom CMS pour la boutique et la communauté). Tunnel Velocity pour router les sous-serveurs proprement. Toute la chaîne de release passe par GitHub Actions pour rester reproductible.',
                lessons: 'Apprentissage majeur : un projet de jeu n\'est pas un projet technique, c\'est un produit communautaire. Le code marche, mais ce qui retient les joueurs ce sont les events, la modération et la régularité.',
                screenshots: []
            },
            en: {
                tagline: 'Full ecosystem around a community Minecraft survival server.',
                metricLabel: 'uptime target across the network',
                problem: 'Running a "real" Minecraft server is much more than a JAR and a VPS — you need a website, a shop, a leaderboard, community tools, moderation, build CI. Otherwise the community evaporates at the first downtime.',
                approach: 'Two-sided stack: gameplay (Paper + custom plugins), web (Azuriom CMS for shop + community). Velocity proxy for clean sub-server routing. The full release chain runs through GitHub Actions to stay reproducible.',
                lessons: 'Big takeaway: a game project is not a technical project — it is a community product. The code works; what keeps players is events, moderation, regularity.',
                screenshots: []
            }
        }
    },
    {
        slug: 'guerre-des-capsules',
        index: 2,
        accent: '#F5D58A',
        icon: 'bi-controller',
        metric: 'ENet',
        stack: ['Godot 4', 'GDScript', 'ENet Net Code', 'Custom Physics'],
        links: [
            { type: 'github', label: 'Voir sur GitHub', href: 'https://github.com/nexos20lv/La-Guerre-Des-Capsules' }
        ],
        content: {
            fr: {
                tagline: 'Fast-FPS multijoueur où des capsules spatiales s\'affrontent à grande vitesse.',
                metricLabel: 'sync réseau bas-niveau',
                problem: 'Faire un FPS multi sur Godot, sans framework gameplay tout fait, c\'est résoudre les trois plus vieux problèmes du genre en même temps : sync réseau bas-latence, physique custom prédictible, et un game-feel qui pardonne pas le moindre frame.',
                approach: 'Boucle de jeu fixée à 60 ticks. Sync via ENet, prédiction client + reconciliation serveur sur les inputs. Physique réécrite pour rester déterministe (pas de moteur physique global). Hit detection au tick, pas au frame.',
                lessons: 'Faire un jeu compétitif solo, c\'est dur. La majorité du travail n\'est pas dans le visible — c\'est dans la stabilité réseau, l\'absence de stutter, et la cohérence entre clients. Le reste est du polish.',
                screenshots: []
            },
            en: {
                tagline: 'Fast multiplayer FPS where space capsules clash at high speed.',
                metricLabel: 'low-level networking',
                problem: 'Building a multi-FPS in Godot without a gameplay framework means solving the three oldest problems of the genre at once: low-latency net sync, predictable custom physics, and a game-feel that forgives no missed frame.',
                approach: 'Game loop locked to 60 ticks. ENet sync with client prediction + server reconciliation on inputs. Physics rewritten to stay deterministic (no global physics engine). Hit detection per tick, not per frame.',
                lessons: 'Building a competitive game solo is hard. Most of the work is not visible — it lives in net stability, no stutter, cross-client consistency. The rest is polish.',
                screenshots: []
            }
        }
    },
    {
        slug: 'nexaria-launcher',
        index: 4,
        accent: '#5B9DFF',
        icon: 'bi-rocket-takeoff-fill',
        metric: 'auto',
        stack: ['Electron', 'Node.js', 'GitHub Actions', 'Squirrel Update'],
        links: [
            { type: 'github', label: 'Voir sur GitHub', href: 'https://github.com/nexos20lv/Nexaria-Launcher' }
        ],
        content: {
            fr: {
                tagline: 'Launcher Minecraft moderne pour Nexaria : auth, mods, mise à jour silencieuse.',
                metricLabel: 'mises à jour silencieuses',
                problem: 'Demander aux joueurs d\'installer Java, le bon profil, les bons mods et de tout maintenir à la main, c\'est diviser la base par dix dès la première update. Il fallait un bouton "Jouer" qui marche, point.',
                approach: 'Electron pour l\'enveloppe desktop. Auto-update via Squirrel + GitHub Releases. Vérification d\'intégrité des mods (hash) avant lancement. Intégration Azuriom pour l\'auth, présence Discord temps-réel pour le rich-presence.',
                lessons: 'Faire une app desktop "qui ne pose pas de question" demande bien plus d\'attention qu\'une app web. Chaque erreur silencieuse devient un ticket de support. La doc d\'erreur est aussi importante que la feature.',
                screenshots: []
            },
            en: {
                tagline: 'Modern Minecraft launcher for Nexaria: auth, mods, silent updates.',
                metricLabel: 'silent updates',
                problem: 'Asking players to install Java, the right profile, the right mods, and maintain it all by hand divides your base by 10 on the first update. We needed a "Play" button that just works.',
                approach: 'Electron for the desktop shell. Auto-update via Squirrel + GitHub Releases. Mod hash verification before launch. Azuriom auth integration, Discord rich-presence.',
                lessons: 'Building a desktop app that "asks nothing" takes far more care than a web app. Every silent error becomes a support ticket. Error docs matter as much as features.',
                screenshots: []
            }
        }
    }
];

/** Look up a flagship case-study by carousel index. Returns null if none. */
export function findFlagshipByIndex(index) {
    return FLAGSHIP_PROJECTS.find((p) => p.index === index) || null;
}

/** Look up by slug (used for hash deep-linking). */
export function findFlagshipBySlug(slug) {
    return FLAGSHIP_PROJECTS.find((p) => p.slug === slug) || null;
}
