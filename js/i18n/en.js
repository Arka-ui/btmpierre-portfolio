export const en = {
    meta: {
        title: 'Pierre | Creative Developer',
        description: 'Portfolio of Pierre Bouteman, a full-stack developer focused on web and desktop applications.'
    },
    loader: {
        init: '> SYSTEM INITIALIZING...',
        kernel: '> LOADING KERNEL V2.1.0-STABLE...',
        mem: '> CHECKING SYSTEM MEMORY... [OK]',
        network: '> TESTING NETWORK CONNECTIVITY... [21ms]',
        mesh: '> CONFIGURING GEOMETRIC MESH...',
        experience: '> RETRIEVING JOURNEY DATA (GITHUB API)...',
        projects: '> LOADING ACHIEVEMENTS...',
        supabase: '> SUPABASE AUTHENTICATION... [SUCCESS]',
        database: '> RETRIEVING REAL-TIME STATES...',
        i18n: '> LOADING LANGUAGE MODULES...',
        ready: '> SYSTEM OPERATIONAL. WELCOME.'
    },
    common: {
        skipToContent: 'Skip to main content',
        languageSwitcher: 'Language switcher',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        backToTop: 'Back to top',
        avatarAlt: 'Discord avatar'
    },
    nav: {
        projects: 'Projects',
        about: 'About',
        skills: 'Skills',
        experience: 'Experience',
        contact: 'Contact',
        drawerAria: 'Navigation menu'
    },
    marquee: {
        title: {
            line1: 'Technologies I use',
            line2: 'most often'
        }
    },
    hero: {
        tag: ' Available for projects',
        title: { prefix: 'Creative', highlight: 'Full-Stack', suffix: 'Developer' },
        desc: 'I build complete architectures and immersive interfaces. My priority is robust software engineering, with AI used as an occasional accelerator.',
        cta: { projects: 'View projects', contact: 'Contact me', tour: 'See it in 30 seconds', tourRunning: 'Guided tour running...' },
        tour: {
            step1: '1/3 Featured projects',
            step2: '2/3 Multi-project showcase',
            step3: '3/3 Direct contact',
            skip: 'Skip to next step'
        },
        status: {
            available: ' Available for projects',
            available_busy: ' Available (Working on {count} projects in parallel)',
            busy: ' Unavailable (Working on {count} projects)',
            busy_general: ' Currently busy on projects',
            loading: ' Syncing status...'
        }
    },
    visitors: {
        loading: 'Visitors online: ...',
        singular: '{count} visitor online',
        plural: '{count} visitors online'
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
        12: 'Python',
        modalMeta: 'TECH STACK',
        modalTitle: 'Skill',
        closeModalAria: 'Close skill window',
        levels: {
            expert: 'Expert',
            advanced: 'Advanced',
            intermediate: 'Intermediate',
            learning: 'Learning',
            beginner: 'Beginner'
        }
    },
    sections: {
        about: { tag: '01 / ABOUT' },
        skills: { tag: '02 / SKILLS', title: 'My Skills', frontend: 'Frontend', backend: 'Backend', tools: 'Tools & Infra', uiEng: 'UI Engineering' },
        experience: { tag: '03 / EXPERIENCE', title: 'My Journey' },
        projects: { tag: '04 / PROJECTS', title: 'What I\'ve Built' },
        contact: { tag: '05 / CONTACT' }
    },
    seo: {
        about: 'Full-stack developer based in France, building robust web and desktop applications focused on performance and maintainability.',
        skills: 'Tech stack organized by domain, with an honest skill level for each tool — based on real projects.',
        experience: 'Journey focused on software engineering, architecture, reliable delivery, and real-world project execution.',
        projects: 'Selection of web, desktop, and dev tooling projects with emphasis on UX, performance, observability, and code quality.',
        contact: 'Available for web/desktop collaborations, product optimization, automation, and long-term maintenance.'
    },
    experience: {
        toggle: {
            view: 'View',
            collapse: 'Collapse'
        },
        1: {
            title: 'Full-Stack Developer',
            company: 'Personal Projects',
            date: 'Since 2024',
            desc: 'Development of complex applications like Home Assistant Desktop and Nexaria Launcher. Focus on performance and user experience.'
        },
        2: {
            title: 'High School Student | STI2D',
            company: 'Lycée Paul Duez (Cambrai)',
            date: '2024 — 2026 (Ongoing)',
            desc: 'Currently in 11th grade (Première STI2D) focusing on industrial and sustainable development technologies.'
        },
        3: {
            title: 'Middle School Student',
            company: 'Collège Paul Duez (Cambrai)',
            date: '2020 — 2024',
            desc: 'Successfully completed middle school education.'
        },
        4: {
            title: '10th Grade Intern',
            company: 'Déclic Info',
            date: 'June 2025',
            desc: 'Observation and immersion internship in IT maintenance and services.'
        },
        5: {
            title: '9th Grade Intern',
            company: 'ASC Computer',
            date: 'Jan 2024',
            desc: 'First contact with the professional IT world.'
        }
    },
    projects: {
        learnMore: 'Learn more',
        github: 'View on GitHub',
        source: 'Source code',
        buildBadge: 'In build',
        buildNow: {
            title: 'Currently in build',
            subtitle: 'Active projects in creation and testing',
            empty: 'No active project right now.'
        },
        clientMode: {
            title: 'Client mode:',
            ariaLabel: 'Client mode filters',
            all: 'All',
            web: 'Website',
            desktop: 'Desktop',
            maintenance: 'Maintenance'
        },
        closeModalAria: 'Close project window',
        featuredMetrics: {
            title: 'Featured projects (GitHub)',
            stars: 'Total stars',
            release: 'Latest release',
            buildTime: 'Build time'
        },
        featured: 'Featured',
        published: 'Published projects',
        contributors: 'Contributors',
        seeAll: 'View all projects →',
        quality: {
            ci: 'CI',
            updated: 'Updated',
            version: 'Version',
            release: 'Release',
            stable: 'stable',
            prerelease: 'pre-release',
            none: 'none'
        },
        status: {
            production: 'Live',
            testing: 'Testing',
            creation: 'In creation',
            archived: 'Archived'
        },
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
            repo: 'nexos20lv/La-Guerre-Des-Capsules',
            desc: 'Multiplayer fast-FPS with intense and competitive gameplay.',
            details: {
                1: 'Fast shooter prototype where players control space capsules in dynamic, skill-focused, mobility-driven combat.',
                2: '<strong>Highlights:</strong> ENet networking synchronization, custom physics behaviors, and a gameplay loop designed for immediate fun.'
            }
        },
        4: {
            meta: 'FRONT-END',
            title: 'Portfolio',
            repo: 'nexos20lv/nexos20lv.github.io',
            desc: 'Current version of my portfolio, designed for a modern immersive experience.',
            details: {
                1: 'Production portfolio website designed to showcase my projects through a clear interface, strong visual identity, and fluid interactions.',
                2: '<strong>Focus:</strong> vanilla HTML/CSS/JavaScript front-end architecture, custom animations, presentation modals, and performance-oriented design.'
            }
        },
        5: {
            meta: 'DESKTOP APP',
            title: 'Nexaria Launcher',
            repo: 'nexos20lv/Nexaria-Launcher',
            desc: 'Modern Minecraft launcher with automatic updates and mod management.',
            details: {
                1: 'Premium desktop client for the Nexaria ecosystem: authentication, streamlined setup, account handling, and polished user experience.',
                2: '<strong>Highlights:</strong> silent auto-update, mod integrity checks, Azuriom integration, and real-time Discord presence.'
            }
        },
        6: {
            meta: 'CMS PLUGIN',
            title: 'WebMap',
            repo: 'nexos20lv/WebMap',
            desc: 'Azuriom plugin to integrate Dynmap, BlueMap, or Pl3xMap in a few clicks.',
            details: {
                1: 'Simplicity-focused plugin that adds a map section directly into an Azuriom website without custom development.',
                2: '<strong>Goal:</strong> quickly bridge the web experience and Minecraft server through a clear admin-side configuration.'
            }
        },
        7: {
            meta: 'DESKTOP APP',
            title: 'Home Assistant Desktop',
            repo: 'nexos20lv/Home-Assistant-Desktop',
            desc: 'Dedicated Home Assistant desktop client with PC sensors and quick access.',
            details: {
                1: 'Standalone desktop app to control Home Assistant with a smooth interface and native experience (tray, global shortcuts).',
                2: '<strong>Features:</strong> auto-updates, machine metrics integration (CPU, RAM, battery, uptime), and a workflow designed for daily use.'
            }
        },
        8: {
            meta: 'MONITORING',
            title: 'AzureLab Dashboard',
            repo: 'nexos20lv/AzureLab-Dashboard',
            desc: 'Real-time VPS dashboard to monitor server and network health.',
            details: {
                1: 'Monitoring dashboard displaying CPU, RAM, disk, uptime, bandwidth, and latency with periodic updates.',
                2: '<strong>Approach:</strong> lightweight PHP stack, server-side system metrics collection, and clear visualization with interactive charts.'
            }
        },
        9: {
            meta: 'WEB APP',
            title: 'NexShare',
            repo: 'nexos20lv/NexShare',
            desc: 'P2P file transfer web app with session code and QR support.',
            details: {
                1: 'Web app for direct file transfer between two devices, without account and without server-side storage, using short-lived sessions and a share code.',
                2: '<strong>Highlights:</strong> WebRTC peer-to-peer connection, QR code for quick pairing, responsive desktop/mobile interface, and a simplicity-first UX.'
            },
            action: 'Open app'
        },
        10: {
            meta: 'DESKTOP APP',
            title: 'La Guerre Des Capsules Launcher',
            repo: 'nexos20lv/La-Guerre-Des-Capsules-Launcher',
            desc: 'Dedicated launcher to install and start the game quickly.',
            details: {
                1: 'Desktop companion app designed to simplify game access, gather useful files, and streamline startup for players.',
                2: '<strong>Goal:</strong> provide a smoother install/start workflow than manual setup.'
            }
        },
        11: {
            meta: 'GAME DISTRIBUTION',
            title: 'La Guerre Des Capsules DL',
            repo: 'nexos20lv/La-Guerre-Des-Capsules-DL',
            desc: 'Distribution repository for project builds and downloadable files.',
            details: {
                1: 'Repository focused on download and distribution of deliverables related to La Guerre Des Capsules.',
                2: '<strong>Usage:</strong> centralize published versions and make file retrieval easier for players and testers.'
            }
        }
    },
    search: {
        placeholder: "Search projects (Title, tags...)...",
        noResults: "No projects found.",
        kbd: "ESC to close"
    },
    about: {
        title: 'About',
        bioLabel: 'Bio',
        projects: 'Projects',
        years: 'Years',
        available: 'Open to work',
        location: 'Paris · Remote',
        skills: 'Skills',
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
    contact: {
        title: 'Have a project in mind?',
        formLabel: 'Send a message',
        socialsLabel: 'Social networks',
        discordServer: 'My Discord Server',
        responseTime: 'Average response time: < 24h',
        discordServer: 'My Discord server',
        name: 'Your name',
        email: 'Your email',
        message: 'Your message...',
        send: 'Send message',
        success: 'Message sent successfully!',
        error: 'Error sending message. Try again later.',
        booking: {
            title: 'Book a Call',
            openQuick: 'Quick booking',
            subtitle: 'Pick a date and time, I confirm ASAP.',
            formSubtitle: 'A few details to organize our discussion.',
            closeModalAria: 'Close modal',
            availabilityLabel: 'Available slots (Europe/Paris)',
            availabilityInfo: 'Mon-Fri: 18:00-20:00 · Sat: 14:00-18:00',
            prevMonthAria: 'Previous month',
            nextMonthAria: 'Next month',
            chooseDate: 'Choose a date',
            chooseTime: 'Choose a time',
            selectDateFirst: 'Select a date first',
            noSlotsLeft: 'No slots left for this date',
            weekdays: {
                mon: 'M',
                tue: 'T',
                wed: 'W',
                thu: 'T',
                fri: 'F',
                sat: 'S',
                sun: 'S'
            },
            slots: {
                week: 'Mon-Fri · 18:00-20:00',
                sat: 'Sat · 14:00-18:00'
            },
            formTitle: 'Book a call',
            name: 'Your name',
            email: 'Your email (important)',
            phone: 'Your phone',
            selectedDate: 'Preferred date',
            selectedTime: 'Preferred time',
            selectedSlot: 'Preferred slot',
            projectDesc: 'Project description',
            projectDescPlaceholder: 'Context, goals, timeline...',
            submit: 'Book',
            cancel: 'Cancel',
            success: 'Booking confirmed! I\'ll contact you soon.',
            error: 'Booking failed. Please try again.',
            templatesLabel: 'Quick templates:',
            templates: {
                web: 'Website',
                desktop: 'Desktop app',
                maintenance: 'Maintenance'
            },
            messages: {
                web: 'Hi Pierre,\n\nI\'m looking for a developer for a web project.\n\nContext:\n-\n\nGoal:\n-\n\nExpected timeline:\n-\n\nEstimated budget:\n-',
                desktop: 'Hi Pierre,\n\nI\'d like to build/improve a desktop application.\n\nTechnical context:\n-\n\nPriority features:\n-\n\nTarget platforms:\n-\n\nTimeline:\n-',
                maintenance: 'Hi Pierre,\n\nI need help with maintenance/optimization.\n\nApplication:\n-\n\nCurrent issues:\n-\n\nPriority:\n-\n\nCurrent stack:\n-'
            }
        }
    },
    donation: {
        cta: 'Buy Me A Coffee',
        title: 'Support me on Buy Me A Coffee'
    },
    github: {
        metricsTitle: 'GITHUB METRICS',
        repos: 'Repos',
        stars: 'Stars'
    },
    terminal: {
        title: 'SYSTEM_TERMINAL_V3',
        closeAria: 'Close terminal',
        welcome: "Type 'help' for available commands."
    },
    footer: {
        copyright: '© 2026 Pierre Bouteman. Handcrafted with <span style="color:var(--primary)">❤</span> and code.',
        top: 'Back to top'
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
};
