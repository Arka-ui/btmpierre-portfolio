declare const Deno: {
    env: { get: (key: string) => string | undefined };
    serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

type ContactPayload = {
    provider?: string;
    type?: 'contact' | 'booking' | string;
    timestamp?: string;
    text?: string;
    /** Honeypot field — any non-empty value means it's a bot. */
    website?: string;
    /** Cloudflare Turnstile response token from the client widget. */
    turnstileToken?: string;
    contact?: {
        name?: string;
        email?: string;
        message?: string;
    };
    booking?: {
        name?: string;
        email?: string;
        phone?: string;
        date?: string;
        time?: string;
        dateDisplay?: string;
        description?: string;
    };
};

// ── In-memory rate limit (per Deno isolate). Not a distributed limiter but
// enough to throttle a single noisy IP between cold starts. ───────────────
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const ipHits = new Map<string, number[]>();

function rateLimit(ip: string): { ok: boolean; retryAfterSec: number } {
    const now = Date.now();
    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    const prior = (ipHits.get(ip) || []).filter((t) => t > cutoff);
    if (prior.length >= RATE_LIMIT_MAX) {
        const retryAfterSec = Math.max(1, Math.ceil((prior[0] + RATE_LIMIT_WINDOW_MS - now) / 1000));
        return { ok: false, retryAfterSec };
    }
    prior.push(now);
    ipHits.set(ip, prior);

    // Opportunistic GC so the map doesn't grow forever.
    if (ipHits.size > 5000) {
        for (const [key, times] of ipHits) {
            const filtered = times.filter((t) => t > cutoff);
            if (filtered.length === 0) ipHits.delete(key);
            else ipHits.set(key, filtered);
        }
    }
    return { ok: true, retryAfterSec: 0 };
}

async function verifyTurnstile(token: string, remoteIp: string): Promise<boolean> {
    const secret = Deno.env.get('TURNSTILE_SECRET');
    // No secret configured → skip verification (dev / staging fallback).
    if (!secret) return true;
    if (!token) return false;

    try {
        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ secret, response: token, remoteip: remoteIp }).toString()
        });
        const data = await res.json().catch(() => ({}));
        return Boolean(data.success);
    } catch {
        return false;
    }
}

function toSafeLine(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
}

function toReadableDate(value?: string): string {
    const parsed = value ? new Date(value) : new Date();
    const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    return date.toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short'
    });
}

function buildFallbackText(payload: ContactPayload): string {
    const now = toReadableDate(payload.timestamp);

    if (payload.type === 'booking') {
        const booking = payload.booking || {};
        return [
            '📅 Nouvelle reservation rapide',
            '━━━━━━━━━━━━',
            '',
            '👤 Contact',
            `• Nom: ${toSafeLine(booking.name)}`,
            `• Email: ${toSafeLine(booking.email)}`,
            `• Telephone: ${toSafeLine(booking.phone) || 'Non fourni'}`,
            '',
            '🕒 Creneau',
            `• Date: ${toSafeLine(booking.dateDisplay || booking.date)}`,
            `• Heure: ${toSafeLine(booking.time)}`,
            '',
            '🧩 Projet',
            toSafeLine(booking.description),
            '',
            '📎 Meta',
            `• Recu: ${now}`,
            '• Source: Reservation rapide'
        ].join('\n');
    }

    const contact = payload.contact || {};
    return [
        '📬 Nouveau message portfolio',
        '━━━━━━━━━━━━',
        '',
        '👤 Contact',
        `• Nom: ${toSafeLine(contact.name)}`,
        `• Email: ${toSafeLine(contact.email)}`,
        '',
        '📝 Message',
        toSafeLine(contact.message),
        '',
        '📎 Meta',
        `• Recu: ${now}`,
        '• Source: Formulaire contact'
    ].join('\n');
}

async function sendTelegramMessage(text: string): Promise<Response> {
    const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!token || !chatId) {
        return new Response(
            JSON.stringify({ error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }

    const telegramEndpoint = `https://api.telegram.org/bot${token}/sendMessage`;

    const telegramRes = await fetch(telegramEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true
        })
    });

    if (!telegramRes.ok) {
        const errorBody = await telegramRes.text();
        return new Response(
            JSON.stringify({ error: 'Telegram send failed.', details: errorBody }),
            {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const clientIp = (req.headers.get('cf-connecting-ip')
        || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || 'unknown').slice(0, 64);

    const limit = rateLimit(clientIp);
    if (!limit.ok) {
        return new Response(JSON.stringify({ error: 'Too many requests.' }), {
            status: 429,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Retry-After': String(limit.retryAfterSec)
            }
        });
    }

    try {
        const body = await req.json();
        const payload: ContactPayload = body?.payload || {};

        // Honeypot — a real user never fills the hidden `website` field.
        if (toSafeLine(payload.website).length > 0) {
            // Respond 200 to avoid giving bots feedback. Silently drop.
            return new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Turnstile challenge (skipped when TURNSTILE_SECRET is not set).
        const captchaOk = await verifyTurnstile(toSafeLine(payload.turnstileToken), clientIp);
        if (!captchaOk) {
            return new Response(JSON.stringify({ error: 'Captcha failed.' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const provider = toSafeLine(payload.provider).toLowerCase();
        if (provider && provider !== 'telegram') {
            return new Response(JSON.stringify({ error: 'Unsupported provider.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const text = toSafeLine(payload.text) || buildFallbackText(payload);
        if (!text) {
            return new Response(JSON.stringify({ error: 'Empty message payload.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Hard cap so oversized payloads can't pile into Telegram.
        if (text.length > 4000) {
            return new Response(JSON.stringify({ error: 'Message too long.' }), {
                status: 413,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return await sendTelegramMessage(text);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});