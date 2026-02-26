export const i18n = {
        fr: {
            meta: {
                title: 'Pierre | Développeur Créatif',
                description: 'Portfolio de Pierre Bouteman, développeur full-stack orienté applications web et desktop.'
            },
            loader: { init: '> INITIALISATION DU SYSTÈME...' },
            nav: { projects: 'Projets', about: 'À propos', contact: 'Contact' },
            hero: {
                title: { prefix: 'Développeur', highlight: 'Front & Back-End.' },
                desc: 'Je conçois des architectures complètes et des interfaces immersives. Ma priorité reste l’ingénierie logicielle robuste, avec l’IA comme accélérateur ponctuel.',
                cta: { projects: 'Voir les projets', contact: 'Me contacter' }
            },
            skills: {
                1: 'JavaScript',
                2: 'Electron',
                3: 'PHP',
                4: 'MySQL',
                5: 'Azuriom',
                6: 'Paper API',
                7: 'Docker',
                8: 'GitHub Actions',
                9: 'CI/CD',
                10: 'Ingénierie UI',
                11: 'Godot Engine',
                12: 'Python'
            },
            sections: {
                projects: { tag: '01 / PROJETS', title: 'Sélection de Travaux' },
                about: { tag: '02 / À PROPOS' },
                contact: { tag: '03 / CONTACT' }
            },
            projects: {
                learnMore: 'En savoir plus',
                github: 'Voir sur GitHub',
                source: 'Code source',
                1: {
                    meta: 'APPLICATION WEB',
                    title: 'Conférences Orientation',
                    desc: 'Plateforme d’inscription et de suivi pour conférences scolaires.',
                    details: {
                        1: 'Application web conçue pour le lycée Paul Duez afin de centraliser toute l’organisation des conférences : inscription des élèves, suivi des présences par les enseignants et export administratif en quelques clics.',
                        2: '<strong>Défi technique :</strong> garantir la fiabilité des créneaux en forte affluence et générer des exports PDF dynamiques en temps réel.'
                    },
                    action: 'Accès Interne'
                },
                2: {
                    meta: 'ÉCOSYSTÈME MINECRAFT',
                    title: 'Nexaria',
                    desc: 'Écosystème complet autour d’un serveur survie communautaire.',
                    details: {
                        1: 'Mise en place d’une infrastructure full-stack pour l’univers Nexaria : expérience de jeu, services web et outils communautaires réunis dans une plateforme cohérente.',
                        2: '<strong>Stack :</strong> Paper API pour la partie serveur Minecraft, Azuriom pour le site (boutique, classement, espace communauté).'
                    },
                    action: 'Voir le site'
                },
                3: {
                    meta: 'DÉVELOPPEMENT JEU',
                    title: 'Guerre Des Capsules',
                    desc: 'Fast-FPS multijoueur avec gameplay nerveux et compétitif.',
                    details: {
                        1: 'Prototype de shooter rapide où les joueurs contrôlent des capsules spatiales dans des affrontements dynamiques orientés skill et mobilité.',
                        2: '<strong>Points clés :</strong> synchronisation réseau via ENet, comportements physiques personnalisés et boucle de jeu pensée pour le fun immédiat.'
                    }
                },
                4: {
                    meta: 'FRONT-END',
                    title: 'Portfolio',
                    desc: 'Version actuelle de mon portfolio, pensée pour une expérience moderne et immersive.',
                    details: {
                        1: 'Site portfolio actuellement en production, conçu pour présenter mes projets avec une interface claire, un univers visuel fort et des interactions fluides.',
                        2: '<strong>Focus :</strong> architecture front-end en HTML/CSS/JavaScript vanilla, animations sur-mesure, modales de présentation et design orienté performance.'
                    }
                },
                5: {
                    meta: 'APPLICATION DESKTOP',
                    title: 'Nexaria Launcher',
                    desc: 'Launcher Minecraft moderne avec mises à jour automatiques et gestion des mods.',
                    details: {
                        1: 'Client desktop premium pour l’écosystème Nexaria : authentification, installation simplifiée, gestion des comptes et expérience utilisateur soignée.',
                        2: '<strong>Points clés :</strong> auto-update silencieux, vérification d’intégrité des mods, intégration Azuriom et présence Discord en temps réel.'
                    }
                },
                6: {
                    meta: 'PLUGIN CMS',
                    title: 'WebMap',
                    desc: 'Plugin Azuriom pour intégrer Dynmap, BlueMap ou Pl3xMap en quelques clics.',
                    details: {
                        1: 'Plugin orienté simplicité qui ajoute une section carte directement dans un site Azuriom sans développement custom.',
                        2: '<strong>Objectif :</strong> connecter rapidement l’univers web et le serveur Minecraft avec une configuration claire depuis l’admin panel.'
                    }
                },
                7: {
                    meta: 'APPLICATION DESKTOP',
                    title: 'Home Assistant Desktop',
                    desc: 'Client desktop dédié à Home Assistant avec capteurs PC et accès rapide.',
                    details: {
                        1: 'Application desktop indépendante du navigateur pour piloter Home Assistant avec une interface fluide et une présence native (tray, raccourcis globaux).',
                        2: '<strong>Fonctions :</strong> auto-updates, intégration des métriques machine (CPU, RAM, batterie, uptime) et workflow pensé pour un usage quotidien.'
                    }
                },
                8: {
                    meta: 'SUPERVISION',
                    title: 'AzureLab Dashboard',
                    desc: 'Dashboard VPS en temps réel pour suivre santé serveur et réseau.',
                    details: {
                        1: 'Tableau de bord de supervision affichant CPU, RAM, disque, uptime, bande passante et latence avec actualisation périodique.',
                        2: '<strong>Approche :</strong> stack légère en PHP, métriques système collectées côté serveur et visualisation claire via graphiques interactifs.'
                    }
                }
            },
            about: {
                p1: 'Je suis <span class="highlight">Pierre Bouteman</span>, développeur polyvalent (Front & Back) basé en France.',
                p2: 'Je suis actuellement en <strong>Première STI2D</strong>, et je développe en parallèle des projets concrets pour renforcer mes compétences techniques.',
                p3: 'Mon approche repose sur des bases solides : architecture, qualité de code, performance et maintenabilité. J’utilise les outils IA de manière ciblée pour accélérer certaines étapes, sans jamais remplacer l’analyse technique et les bonnes pratiques d’ingénierie.',
                expertise: {
                    title: 'Expertise Technique',
                    1: {
                        title: 'Applications Desktop & Web',
                        desc: 'JavaScript, Electron, HTML/CSS et architecture front-end pour des apps desktop et des interfaces web interactives.'
                    },
                    2: {
                        title: 'Back-End PHP & Écosystème Minecraft',
                        desc: 'PHP, MySQL et intégrations Azuriom/Paper API pour des outils communautaires (launcher, plugin WebMap, services web).'
                    },
                    3: {
                        title: 'Qualité & Livraison',
                        desc: 'Utilisation avancée des LLMs pour accélérer certaines tâches, avec validation manuelle. Utilisation de Git, releases GitHub et automatisations CI pour livrer des versions stables.'
                    }
                }
            },
            contact: { title: 'Un projet en tête ?' },
            footer: {
                copyright: '© 2026 Pierre Bouteman. Fait main avec <span style="color:var(--primary)">❤</span> et du code.'
            },
            discord: {
                toggleAria: 'Réduire le statut',
                initializing: 'INITIALISATION...',
                waiting: 'En attente du signal...',
                listening: 'Écoute sur Spotify',
                by: 'par',
                playing: 'En jeu',
                awaitingInput: 'EN ATTENTE D’ENTRÉE',
                status: {
                    online: 'EN LIGNE',
                    idle: 'INACTIF',
                    dnd: 'NE PAS DÉRANGER',
                    offline: 'HORS LIGNE'
                }
            }
        },
        en: {
            meta: {
                title: 'Pierre | Creative Developer',
                description: 'Portfolio of Pierre Bouteman, a full-stack developer focused on web and desktop applications.'
            },
            loader: { init: '> SYSTEM INITIALIZING...' },
            nav: { projects: 'Projects', about: 'About', contact: 'Contact' },
            hero: {
                title: { prefix: 'Developer', highlight: 'Front & Back-End.' },
                desc: 'I build complete architectures and immersive interfaces. My priority is robust software engineering, with AI used as an occasional accelerator.',
                cta: { projects: 'View projects', contact: 'Contact me' }
            },
            skills: {
                1: 'JavaScript',
                2: 'Electron',
                3: 'PHP',
                4: 'MySQL',
                5: 'Azuriom',
                6: 'Paper API',
                7: 'Docker',
                8: 'GitHub Actions',
                9: 'CI/CD',
                10: 'UI Engineering',
                11: 'Godot Engine',
                12: 'Python'
            },
            sections: {
                projects: { tag: '01 / PROJECTS', title: 'Selected Work' },
                about: { tag: '02 / ABOUT' },
                contact: { tag: '03 / CONTACT' }
            },
            projects: {
                learnMore: 'Learn more',
                github: 'View on GitHub',
                source: 'Source code',
                1: {
                    meta: 'WEB APP',
                    title: 'Orientation Conferences',
                    desc: 'Registration and tracking platform for school conferences.',
                    details: {
                        1: 'Web application built for Paul Duez high school to centralize conference organization: student registration, attendance tracking for teachers, and admin exports in just a few clicks.',
                        2: '<strong>Technical challenge:</strong> ensuring time-slot reliability under heavy load and generating dynamic PDF exports in real time.'
                    },
                    action: 'Internal Access'
                },
                2: {
                    meta: 'MINECRAFT ECOSYSTEM',
                    title: 'Nexaria',
                    desc: 'Complete ecosystem around a community survival server.',
                    details: {
                        1: 'Built a full-stack infrastructure for the Nexaria universe: gameplay experience, web services, and community tools combined into a single platform.',
                        2: '<strong>Stack:</strong> Paper API for Minecraft server-side, Azuriom for the website (shop, rankings, community area).'
                    },
                    action: 'Visit website'
                },
                3: {
                    meta: 'GAME DEVELOPMENT',
                    title: 'Capsule War',
                    desc: 'Multiplayer fast-FPS with intense and competitive gameplay.',
                    details: {
                        1: 'Fast shooter prototype where players control space capsules in dynamic, skill-focused, mobility-driven combat.',
                        2: '<strong>Highlights:</strong> ENet networking synchronization, custom physics behaviors, and a gameplay loop designed for immediate fun.'
                    }
                },
                4: {
                    meta: 'FRONT-END',
                    title: 'Portfolio',
                    desc: 'Current version of my portfolio, designed for a modern immersive experience.',
                    details: {
                        1: 'Production portfolio website designed to showcase my projects through a clear interface, strong visual identity, and fluid interactions.',
                        2: '<strong>Focus:</strong> vanilla HTML/CSS/JavaScript front-end architecture, custom animations, presentation modals, and performance-oriented design.'
                    }
                },
                5: {
                    meta: 'DESKTOP APP',
                    title: 'Nexaria Launcher',
                    desc: 'Modern Minecraft launcher with automatic updates and mod management.',
                    details: {
                        1: 'Premium desktop client for the Nexaria ecosystem: authentication, streamlined setup, account handling, and polished user experience.',
                        2: '<strong>Highlights:</strong> silent auto-update, mod integrity checks, Azuriom integration, and real-time Discord presence.'
                    }
                },
                6: {
                    meta: 'CMS PLUGIN',
                    title: 'WebMap',
                    desc: 'Azuriom plugin to integrate Dynmap, BlueMap, or Pl3xMap in a few clicks.',
                    details: {
                        1: 'Simplicity-focused plugin that adds a map section directly into an Azuriom website without custom development.',
                        2: '<strong>Goal:</strong> quickly bridge the web experience and Minecraft server through a clear admin-side configuration.'
                    }
                },
                7: {
                    meta: 'DESKTOP APP',
                    title: 'Home Assistant Desktop',
                    desc: 'Dedicated Home Assistant desktop client with PC sensors and quick access.',
                    details: {
                        1: 'Standalone desktop app to control Home Assistant with a smooth interface and native experience (tray, global shortcuts).',
                        2: '<strong>Features:</strong> auto-updates, machine metrics integration (CPU, RAM, battery, uptime), and a workflow designed for daily use.'
                    }
                },
                8: {
                    meta: 'MONITORING',
                    title: 'AzureLab Dashboard',
                    desc: 'Real-time VPS dashboard to monitor server and network health.',
                    details: {
                        1: 'Monitoring dashboard displaying CPU, RAM, disk, uptime, bandwidth, and latency with periodic updates.',
                        2: '<strong>Approach:</strong> lightweight PHP stack, server-side system metrics collection, and clear visualization with interactive charts.'
                    }
                }
            },
            about: {
                p1: 'I am <span class="highlight">Pierre Bouteman</span>, a versatile front-end and back-end developer based in France.',
                p2: 'I am currently in <strong>Première STI2D</strong>, and I build concrete projects in parallel to strengthen my technical skills.',
                p3: 'My approach is built on strong fundamentals: architecture, code quality, performance, and maintainability. I use AI tools selectively to accelerate specific steps, without replacing technical analysis and software engineering best practices.',
                expertise: {
                    title: 'Technical Expertise',
                    1: {
                        title: 'Desktop & Web Applications',
                        desc: 'JavaScript, Electron, HTML/CSS, and front-end architecture for desktop apps and interactive web interfaces.'
                    },
                    2: {
                        title: 'PHP Back-End & Minecraft Ecosystem',
                        desc: 'PHP, MySQL, and Azuriom/Paper API integrations for community tools (launcher, WebMap plugin, web services).'
                    },
                    3: {
                        title: 'Quality & Delivery',
                        desc: 'Advanced use of LLMs to speed up specific tasks, with manual validation. Uses Git, GitHub releases, and CI automations to deliver stable versions.'
                    }
                }
            },
            contact: { title: 'Have a project in mind?' },
            footer: {
                copyright: '© 2026 Pierre Bouteman. Handcrafted with <span style="color:var(--primary)">❤</span> and code.'
            },
            discord: {
                toggleAria: 'Toggle status card',
                initializing: 'INITIALIZING...',
                waiting: 'Waiting for signal...',
                listening: 'Listening on Spotify',
                by: 'by',
                playing: 'Playing',
                awaitingInput: 'AWAITING INPUT',
                status: {
                    online: 'ONLINE',
                    idle: 'IDLE',
                    dnd: 'DO NOT DISTURB',
                    offline: 'OFFLINE'
                }
            }
        }
    };
