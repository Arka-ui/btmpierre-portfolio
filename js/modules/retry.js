export function getBackoffDelay(attempt, retriesConfig = {}) {
    const baseDelay = retriesConfig.baseDelayMs || 1200;
    const maxDelay = retriesConfig.maxDelayMs || 30000;
    const expDelay = Math.min(maxDelay, baseDelay * (2 ** attempt));
    const jitter = Math.floor(Math.random() * Math.max(300, expDelay * 0.2));
    return Math.min(maxDelay, expDelay + jitter);
}
