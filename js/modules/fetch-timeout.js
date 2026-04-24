/**
 * fetch wrapper with a hard timeout via AbortController. Prevents hung requests
 * on stuck connections (GitHub rate-limit pages, Discord RPC, etc.). Returns
 * the native Response; on timeout the promise rejects with an AbortError.
 */
export async function fetchWithTimeout(input, { timeoutMs = 8000, ...init } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}
