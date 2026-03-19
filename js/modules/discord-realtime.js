import { i18n } from '../i18n.js';

export function initDiscordRealtime({
    config,
    t,
    getCurrentLang,
    getBackoffDelay,
    onStatusChange,
    onVisitorsCountChange
}) {
    const discordID = config.discordId;
    const avatarImg = document.getElementById('discord-avatar');
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('discord-status-text');
    const activityContainer = document.getElementById('discord-activity');
    const discordApplicationIconCache = new Map();

    let lanyardAttempts = 0;
    let lanyardReconnectTimer = null;
    let visitorsAttempts = 0;
    let visitorsChannel = null;
    let statusAttempts = 0;
    let statusChannel = null;
    let hasSupabaseStatusSync = false;

    const presenceColors = {
        online: '#00ff88',
        idle: '#faa61a',
        dnd: '#f04747',
        offline: '#747f8d'
    };

    const supabaseClient = (typeof supabase !== 'undefined')
        ? supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
        : null;

    function connectLanyard() {
        const ws = new WebSocket(config.endpoints.lanyardSocket);

        ws.onopen = () => {
            lanyardAttempts = 0;
            ws.send(JSON.stringify({
                op: 2,
                d: { subscribe_to_id: discordID }
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { t: type, d } = data;

            if (type === 'INIT_STATE' || type === 'PRESENCE_UPDATE') {
                updatePresence(d);
            }
        };

        ws.onerror = () => {
            ws.close();
        };

        ws.onclose = () => {
            const delay = getBackoffDelay(lanyardAttempts++, config.retries);
            clearTimeout(lanyardReconnectTimer);
            lanyardReconnectTimer = setTimeout(connectLanyard, delay);
        };
    }

    function getDiscordCdnAssetUrl(applicationId, assetId) {
        if (!applicationId || !assetId) return '';

        if (assetId.startsWith('mp:')) {
            return `https://media.discordapp.net/${assetId.replace('mp:', '')}`;
        }

        return `https://cdn.discordapp.com/app-assets/${applicationId}/${assetId}.png?size=256`;
    }

    async function getDiscordApplicationIconUrl(applicationId) {
        if (!applicationId) return '';

        if (discordApplicationIconCache.has(applicationId)) {
            return discordApplicationIconCache.get(applicationId);
        }

        try {
            const response = await fetch(`${config.endpoints.discordAppRpc}/${applicationId}/rpc`);
            if (!response.ok) {
                discordApplicationIconCache.set(applicationId, '');
                return '';
            }

            const payload = await response.json();
            const iconHash = typeof payload?.icon === 'string' ? payload.icon : '';
            const iconUrl = iconHash
                ? `https://cdn.discordapp.com/app-icons/${applicationId}/${iconHash}.png?size=256`
                : '';

            discordApplicationIconCache.set(applicationId, iconUrl);
            return iconUrl;
        } catch {
            discordApplicationIconCache.set(applicationId, '');
            return '';
        }
    }

    function updatePresence(data) {
        const presence = data.activities ? data : data;

        if (presence.discord_user) {
            const avatarId = presence.discord_user.avatar;
            avatarImg.src = `https://cdn.discordapp.com/avatars/${discordID}/${avatarId}.png`;
        }

        const status = presence.discord_status || 'offline';
        onStatusChange?.(status);

        if (statusIndicator) {
            statusIndicator.style.backgroundColor = presenceColors[status] || presenceColors.offline;
            statusIndicator.style.boxShadow = `0 0 10px ${presenceColors[status] || presenceColors.offline}`;
        }

        if (statusText) {
            statusText.textContent = t(`discord.status.${status}`);
        }

        const spotify = presence.spotify;
        const activities = presence.activities || [];
        const game = activities.find((activity) => activity.type === 0);

        if (spotify) {
            renderSpotify(spotify);
        } else if (game) {
            renderGame(game);
        } else {
            renderIdle();
        }
    }

    function initLiveVisitorsCounter() {
        if (!supabaseClient) {
            onVisitorsCountChange?.(null);
            return;
        }

        const subscribeVisitorsChannel = () => {
            const presenceKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            visitorsChannel = supabaseClient.channel('portfolio-live-visitors', {
                config: {
                    presence: { key: presenceKey }
                }
            });

            const syncVisitorsCount = () => {
                const state = visitorsChannel.presenceState();
                const count = Object.values(state).reduce((acc, entries) => {
                    if (Array.isArray(entries)) return acc + entries.length;
                    return acc + 1;
                }, 0);

                onVisitorsCountChange?.(count);
            };

            visitorsChannel
                .on('presence', { event: 'sync' }, syncVisitorsCount)
                .on('presence', { event: 'join' }, syncVisitorsCount)
                .on('presence', { event: 'leave' }, syncVisitorsCount)
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        visitorsAttempts = 0;
                        await visitorsChannel.track({
                            online_at: new Date().toISOString(),
                            lang: getCurrentLang()
                        });
                        syncVisitorsCount();
                        return;
                    }

                    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                        supabaseClient.removeChannel(visitorsChannel);
                        const delay = getBackoffDelay(visitorsAttempts++, config.retries);
                        setTimeout(subscribeVisitorsChannel, delay);
                    }
                });
        };

        subscribeVisitorsChannel();

        window.addEventListener('beforeunload', () => {
            if (!visitorsChannel) return;
            visitorsChannel.untrack();
            supabaseClient.removeChannel(visitorsChannel);
        });
    }

    async function updateHeroFromSupabase() {
        const heroTag = document.getElementById('hero-availability');
        if (!heroTag || !supabaseClient || hasSupabaseStatusSync) return;
        hasSupabaseStatusSync = true;

        const { data } = await supabaseClient
            .from('portfolio_status')
            .select('*')
            .eq('id', 1)
            .single();

        if (data) {
            applyStatusToUI(data);
        }

        const subscribeStatusChannel = () => {
            statusChannel = supabaseClient
                .channel('status_updates')
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'portfolio_status',
                    filter: 'id=eq.1'
                }, (payload) => {
                    applyStatusToUI(payload.new);
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        statusAttempts = 0;
                        return;
                    }

                    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                        supabaseClient.removeChannel(statusChannel);
                        const delay = getBackoffDelay(statusAttempts++, config.retries);
                        setTimeout(subscribeStatusChannel, delay);
                    }
                });
        };

        subscribeStatusChannel();
    }

    function applyStatusToUI(data) {
        const heroTag = document.getElementById('hero-availability');
        if (!heroTag) return;

        let iconClass = 'bi bi-check-circle-fill';
        let iconColor = '#00ff88';
        let text = '';

        if (data.is_available === false) {
            iconClass = 'bi bi-dash-circle-fill';
            iconColor = '#ff4b4b';
            if (data.active_projects > 0) {
                text = t('hero.status.busy').replace('{count}', data.active_projects);
            } else {
                text = t('hero.status.busy_general');
            }
        } else if (data.active_projects > 0) {
            text = t('hero.status.available_busy').replace('{count}', data.active_projects);
        } else {
            text = t('hero.status.available');
        }

        const icon = document.createElement('i');
        icon.className = iconClass;
        icon.style.color = iconColor;

        const span = document.createElement('span');
        span.textContent = text;
        heroTag.innerHTML = '';
        heroTag.append(icon, span);
    }

    async function updateHeroFromJSON() {
        if (config.supabaseUrl.includes('{{')) {
            const heroTag = document.getElementById('hero-availability');
            if (!heroTag) return;

            try {
                const res = await fetch(`js/status.json?t=${Date.now()}`);
                const data = await res.json();

                if (data.isAvailable === false) {
                    if (data.activeProjects > 0) {
                        heroTag.textContent = t('hero.status.busy').replace('{count}', data.activeProjects);
                    } else {
                        heroTag.textContent = t('hero.status.busy_general');
                    }
                } else if (data.activeProjects > 0) {
                    heroTag.textContent = t('hero.status.available_busy').replace('{count}', data.activeProjects);
                } else {
                    heroTag.textContent = t('hero.status.available');
                }
            } catch {
                const conf = i18n.config;
                if (conf.isAvailable === false) {
                    if (conf.activeProjects > 0) {
                        heroTag.textContent = t('hero.status.busy').replace('{count}', conf.activeProjects);
                    } else {
                        heroTag.textContent = t('hero.status.busy_general');
                    }
                } else if (conf.activeProjects > 0) {
                    heroTag.textContent = t('hero.status.available_busy').replace('{count}', conf.activeProjects);
                } else {
                    heroTag.textContent = t('hero.status.available');
                }
            }
        } else {
            updateHeroFromSupabase();
        }
    }

    function renderSpotify(spotify) {
        const total = spotify.timestamps.end - spotify.timestamps.start;
        const current = Date.now() - spotify.timestamps.start;
        const progress = Math.min((current / total) * 100, 100);
        const defaultCover = 'https://cdn.discordapp.com/embed/avatars/0.png';

        let albumCoverUrl = typeof spotify?.album_art_url === 'string' ? spotify.album_art_url.trim() : '';
        if (albumCoverUrl.startsWith('http://')) {
            albumCoverUrl = albumCoverUrl.replace('http://', 'https://');
        }
        if (!albumCoverUrl.startsWith('https://')) {
            albumCoverUrl = defaultCover;
        }

        const activityRow = document.createElement('div');
        activityRow.className = 'activity-row';

        const img = document.createElement('img');
        img.src = albumCoverUrl;
        img.className = 'activity-icon';
        img.alt = 'Album Art';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.referrerPolicy = 'no-referrer';
        img.onerror = () => {
            img.onerror = null;
            img.src = defaultCover;
        };

        const info = document.createElement('div');
        info.className = 'activity-info';

        const name = document.createElement('span');
        name.className = 'act-name';
        name.textContent = t('discord.listening');

        const details = document.createElement('span');
        details.className = 'act-details';
        details.style.color = '#1db954';
        details.style.fontWeight = '600';
        details.textContent = spotify.song;

        const state = document.createElement('span');
        state.className = 'act-state';
        state.textContent = `${t('discord.by')} ${spotify.artist}`;

        const bar = document.createElement('div');
        bar.className = 'spotify-bar';
        const progressEl = document.createElement('div');
        progressEl.className = 'spotify-progress';
        progressEl.style.width = `${progress}%`;
        bar.appendChild(progressEl);

        info.append(name, details, state, bar);
        activityRow.append(img, info);

        activityContainer.innerHTML = '';
        activityContainer.appendChild(activityRow);
    }

    async function renderGame(game) {
        let iconUrl = getDiscordCdnAssetUrl(game.application_id, game.assets?.large_image)
            || getDiscordCdnAssetUrl(game.application_id, game.assets?.small_image)
            || await getDiscordApplicationIconUrl(game.application_id)
            || 'https://cdn.discordapp.com/embed/avatars/0.png';

        const activityRow = document.createElement('div');
        activityRow.className = 'activity-row';

        const img = document.createElement('img');
        img.src = iconUrl;
        img.className = 'activity-icon';
        img.alt = 'Game Icon';
        img.loading = 'lazy';

        const assetFallbackUrl = getDiscordCdnAssetUrl(game.application_id, game.assets?.small_image)
            || getDiscordCdnAssetUrl(game.application_id, game.assets?.large_image)
            || 'https://cdn.discordapp.com/embed/avatars/0.png';
        img.onerror = () => {
            if (img.src !== assetFallbackUrl) {
                img.src = assetFallbackUrl;
                return;
            }

            img.onerror = null;
            img.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
        };

        const info = document.createElement('div');
        info.className = 'activity-info';

        const name = document.createElement('span');
        name.className = 'act-name';
        name.textContent = game.name;

        const details = document.createElement('span');
        details.className = 'act-details';
        details.textContent = game.details || t('discord.playing');

        const state = document.createElement('span');
        state.className = 'act-state';
        state.textContent = game.state || '';

        info.append(name, details, state);
        activityRow.append(img, info);

        activityContainer.innerHTML = '';
        activityContainer.appendChild(activityRow);
    }

    function renderIdle() {
        activityContainer.innerHTML = '';
        const placeholder = document.createElement('div');
        placeholder.className = 'activity-placeholder mono';
        placeholder.style.fontSize = '0.8rem';
        placeholder.style.opacity = '0.7';

        const prompt = document.createElement('span');
        prompt.style.color = 'var(--primary)';
        prompt.textContent = '> ';

        placeholder.appendChild(prompt);
        placeholder.append(t('discord.awaitingInput'));

        activityContainer.appendChild(placeholder);
    }

    if (document.getElementById('discord-activity')) {
        connectLanyard();
    }

    initLiveVisitorsCounter();
    updateHeroFromJSON();

    const card = document.getElementById('lanyard-card');
    const toggleBtn = document.querySelector('.card-toggle');
    const toggleIcon = document.querySelector('.toggle-icon');

    if (card && toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'true');

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('minimized');

            if (card.classList.contains('minimized')) {
                toggleIcon.textContent = '+';
                toggleBtn.setAttribute('aria-expanded', 'false');
            } else {
                toggleIcon.textContent = '−';
                toggleBtn.setAttribute('aria-expanded', 'true');
            }
        });

        card.addEventListener('click', () => {
            if (card.classList.contains('minimized')) {
                card.classList.remove('minimized');
                toggleIcon.textContent = '−';
                toggleBtn.setAttribute('aria-expanded', 'true');
            }
        });
    }
}
