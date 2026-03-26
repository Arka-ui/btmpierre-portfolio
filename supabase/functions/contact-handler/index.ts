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

    try {
        const body = await req.json();
        const payload: ContactPayload = body?.payload || {};

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

        return await sendTelegramMessage(text);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});