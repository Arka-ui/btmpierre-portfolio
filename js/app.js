import { ParticleSystem } from './particles.js';
import { i18n } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {

    // 0. i18n (FR default)
    const langButtons = document.querySelectorAll('.lang-btn');
    const getNested = (object, path) => path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), object);
    const fallbackLang = 'fr';
    let currentLang = localStorage.getItem('portfolio-lang');
    if (!currentLang || !i18n[currentLang]) currentLang = fallbackLang;
    let lastDiscordStatus = null;

    function t(key) {
        return getNested(i18n[currentLang], key) ?? getNested(i18n[fallbackLang], key) ?? key;
    }

    function applyLanguage(lang) {
        if (!i18n[lang]) return;

        currentLang = lang;
        localStorage.setItem('portfolio-lang', currentLang);
        document.documentElement.lang = currentLang;

        langButtons.forEach((button) => {
            button.classList.toggle('active', button.dataset.lang === currentLang);
        });

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            element.textContent = t(element.dataset.i18n);
        });

        document.querySelectorAll('[data-i18n-html]').forEach((element) => {
            element.innerHTML = t(element.dataset.i18nHtml);
        });

        document.querySelectorAll('[data-i18n-content]').forEach((element) => {
            element.setAttribute('content', t(element.dataset.i18nContent));
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
            element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
        });

        if (lastDiscordStatus) {
            const statusNode = document.getElementById('discord-status-text');
            if (statusNode) {
                statusNode.textContent = t(`discord.status.${lastDiscordStatus}`);
            }
        }

        const modalElement = document.getElementById('project-modal');
        if (modalElement?.classList.contains('open')) {
            openModal(activeIndex);
        }
    }

    langButtons.forEach((button) => {
        button.addEventListener('click', () => {
            applyLanguage(button.dataset.lang);
        });
    });

    applyLanguage(currentLang);

    // 1. Loader
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.visibility = 'hidden', 500);
        }
    }, 1500); // 1.5s Load simulation

    // 2. Initialize Particles
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        new ParticleSystem('bg-canvas');
    }

    // 3. Custom Cursor (Optimized)
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
        document.body.classList.add('use-native-cursor');
    }

    if (!isSafari && cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {

        let mouseX = 0;
        let mouseY = 0;
        let outlineX = 0;
        let outlineY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Dot follows instantly
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        // Smooth outline follower loop
        const animateCursor = () => {
            // Lerp (Linear Interpolation) for smooth delay
            // outlineX += (mouseX - outlineX) * 0.15; // Adjustment speed
            // outlineY += (mouseY - outlineY) * 0.15;

            // Or simplified for performance if lerp feels floaty:
            outlineX += (mouseX - outlineX) * 0.2;
            outlineY += (mouseY - outlineY) * 0.2;

            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;

            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Hover States
        document.querySelectorAll('a, button, .card-3d, .clickable, .carousel-item').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.borderColor = 'var(--primary)';
                cursorOutline.style.backgroundColor = 'rgba(0, 255, 242, 0.1)';
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                cursorOutline.style.backgroundColor = 'transparent';
            });
        });
    }

    // 4. 3D Tilt Effect (Optimized)
    if (window.matchMedia("(pointer: fine)").matches) {
        const cards = document.querySelectorAll('.card-3d');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                // Remove transition during movement to prevent jitter
                card.style.transition = 'none';
            });

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Max tilt 10 degrees
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                // Restore transition for smooth return
                card.style.transition = 'all 0.5s ease';
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }

    // 5. Header Scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 6. Lanyard Integration (WebSocket)
    const discordID = '1288079115248992297';
    const avatarImg = document.getElementById('discord-avatar');
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('discord-status-text');
    const activityContainer = document.getElementById('discord-activity');

    const colors = {
        online: '#00ff88',
        idle: '#faa61a',
        dnd: '#f04747',
        offline: '#747f8d'
    };

    function connectLanyard() {
        const ws = new WebSocket('wss://api.lanyard.rest/socket');

        ws.onopen = () => {
            // Initialize subscription
            ws.send(JSON.stringify({
                op: 2,
                d: { subscribe_to_id: discordID }
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { t, d } = data;

            if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
                updatePresence(d);
            }
        };

        ws.onclose = () => {
            // Reconnect after 5s
            setTimeout(connectLanyard, 5000);
        };
    }

    function updatePresence(data) {
        // Handle sync vs update structure
        const presence = data.activities ? data : data; // INIT_STATE has full object, PRESENCE_UPDATE might be partial but Lanyard sends full usually for subscribed

        // 1. Update Avatar & Indicator
        if (presence.discord_user) {
            const avatarId = presence.discord_user.avatar;
            avatarImg.src = `https://cdn.discordapp.com/avatars/${discordID}/${avatarId}.png`;
        }

        const status = presence.discord_status;
        lastDiscordStatus = status;
        statusIndicator.style.background = colors[status] || colors.offline;
        statusIndicator.style.boxShadow = `0 0 10px ${colors[status] || colors.offline}`;
        statusText.textContent = t(`discord.status.${status}`);

        // 2. Update Activity
        const spotify = presence.spotify;
        const activities = presence.activities || [];

        // Find a game (type 0) if not spotify
        const game = activities.find(a => a.type === 0);

        if (spotify) {
            renderSpotify(spotify);
        } else if (game) {
            renderGame(game);
        } else {
            renderIdle();
        }
    }

    function renderSpotify(spotify) {
        // Calc progress
        const total = spotify.timestamps.end - spotify.timestamps.start;
        const current = Date.now() - spotify.timestamps.start;
        const progress = Math.min((current / total) * 100, 100);

        activityContainer.innerHTML = `
            <div class="activity-row">
                <img src="${spotify.album_art_url}" class="activity-icon" alt="Album Art">
                <div class="activity-info">
                    <span class="act-name">${t('discord.listening')}</span>
                    <span class="act-details" style="color:#1db954; font-weight:600">${spotify.song}</span>
                    <span class="act-state">${t('discord.by')} ${spotify.artist}</span>
                    <div class="spotify-bar">
                        <div class="spotify-progress" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderGame(game) {
        let iconUrl = 'https://cdn.discordapp.com/embed/avatars/0.png'; // Fallback

        if (game.assets && game.assets.large_image) {
            if (game.assets.large_image.startsWith('mp:')) {
                iconUrl = `https://media.discordapp.net/${game.assets.large_image.replace('mp:', '')}`;
            } else {
                iconUrl = `https://cdn.discordapp.com/app-assets/${game.application_id}/${game.assets.large_image}.png`;
            }
        }

        activityContainer.innerHTML = `
             <div class="activity-row">
                <img src="${iconUrl}" class="activity-icon" alt="Game Icon">
                <div class="activity-info">
                    <span class="act-name">${game.name}</span>
                    <span class="act-details">${game.details || t('discord.playing')}</span>
                    <span class="act-state">${game.state || ''}</span>
                </div>
            </div>
        `;
    }

    function renderIdle() {
        activityContainer.innerHTML = `
             <div class="activity-placeholder mono" style="font-size:0.8rem; opacity:0.7">
                     <span style="color:var(--primary)">></span> ${t('discord.awaitingInput')}
             </div>
        `;
    }

    // Start WebSocket
    if (document.getElementById('discord-activity')) {
        connectLanyard();
    }

    // Toggle Card logic
    const card = document.getElementById('lanyard-card');
    const toggleBtn = document.querySelector('.card-toggle');
    const toggleIcon = document.querySelector('.toggle-icon');

    if (card && toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('minimized');

            if (card.classList.contains('minimized')) {
                toggleIcon.textContent = '+';
            } else {
                toggleIcon.textContent = '−';
            }
        });

        // Expand on click if minimized
        card.addEventListener('click', () => {
            if (card.classList.contains('minimized')) {
                card.classList.remove('minimized');
                toggleIcon.textContent = '−';
            }
        });
    }

    // 7. Projects Grid & Modal Logic
    const items = document.querySelectorAll('.carousel-item');
    const modal = document.getElementById('project-modal');
    const closeModal = document.querySelector('.close-modal');
    let activeIndex = 0;

    function markActiveItem(index) {
        items.forEach((item, itemIndex) => {
            item.classList.toggle('active', itemIndex === index);
        });
    }

    // Modal Logic
    // Modal Logic
    function openModal(index) {
        activeIndex = index;
        markActiveItem(index);

        const item = items[index];
        const title = item.querySelector('.project-title').textContent;
        const meta = item.querySelector('.project-meta').textContent;
        // Data extraction
        const detailsClone = item.querySelector('.hidden-details').cloneNode(true);
        detailsClone.style.display = 'block';

        // Populate Modal
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-meta').textContent = meta;

        const descContainer = document.getElementById('modal-desc');
        descContainer.innerHTML = '';
        descContainer.appendChild(detailsClone);

        // Show Overlay (Fix: use class instead of showModal)
        modal.classList.add('open');
        document.body.classList.add('modal-open');
        if (cursorDot && cursorOutline) {
            cursorDot.style.display = 'none';
            cursorOutline.style.display = 'none';
        }
    }

    // Interactions
    items.forEach((item, index) => {
        item.setAttribute('tabindex', '0');
        item.querySelector('.learn-more-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(index);
        });

        item.addEventListener('click', (e) => {
            openModal(index);
        });

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(index);
            }
        });
    });

    // Close logic
    function hideModal() {
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
        if (cursorDot && cursorOutline) {
            cursorDot.style.display = '';
            cursorOutline.style.display = '';
        }
    }

    closeModal?.addEventListener('click', (e) => {
        e.stopPropagation();
        hideModal();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    // Initialize
    markActiveItem(activeIndex);

    console.log("System Initialized: Ultra Modern Portfolio V3");
});
