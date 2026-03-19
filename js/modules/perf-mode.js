export function runWhenIdle(callback, timeout = 1200) {
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(callback, { timeout });
        return;
    }
    setTimeout(callback, 250);
}

export function shouldAutoEnablePerfMode(perfConfig = {}) {
    const lowThreads = typeof navigator.hardwareConcurrency === 'number'
        && navigator.hardwareConcurrency <= (perfConfig.lowEndCpuThreads || 4);
    const lowMemory = typeof navigator.deviceMemory === 'number'
        && navigator.deviceMemory <= (perfConfig.lowEndDeviceMemoryGb || 4);
    const smallViewport = window.innerWidth <= (perfConfig.lowEndViewportWidth || 900);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reducedMotion || lowThreads || lowMemory || smallViewport;
}

export function initPerformanceMode(perfToggle, autoEnabled) {
    const hasManualChoice = localStorage.getItem('perf-mode') !== null;
    const isPerfMode = localStorage.getItem('perf-mode') === 'true'
        || (!hasManualChoice && autoEnabled);

    if (isPerfMode) {
        document.body.classList.add('perf-mode');
        perfToggle?.classList.add('active');
    }

    perfToggle?.addEventListener('click', () => {
        const active = document.body.classList.toggle('perf-mode');
        perfToggle.classList.toggle('active', active);
        localStorage.setItem('perf-mode', String(active));
    });
}

export function initAccessibilityMode(accessibilityToggle) {
    const saved = localStorage.getItem('accessibility-mode') === 'true';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const enabled = saved || reducedMotion;

    document.body.classList.toggle('native-cursor', enabled);
    accessibilityToggle?.classList.toggle('active', enabled);
    accessibilityToggle?.setAttribute('aria-pressed', String(enabled));

    accessibilityToggle?.addEventListener('click', () => {
        const isActive = document.body.classList.toggle('native-cursor');
        accessibilityToggle.classList.toggle('active', isActive);
        accessibilityToggle.setAttribute('aria-pressed', String(isActive));
        localStorage.setItem('accessibility-mode', String(isActive));
    });
}

export function initUltraCompactMode() {
    const params = new URLSearchParams(window.location.search);
    const compactParam = params.get('compact');

    if (compactParam === '1') {
        localStorage.setItem('ultra-compact', 'true');
    } else if (compactParam === '0') {
        localStorage.setItem('ultra-compact', 'false');
    }

    const isUltraCompact = localStorage.getItem('ultra-compact') === 'true';
    document.body.classList.toggle('ultra-compact', isUltraCompact);
}
