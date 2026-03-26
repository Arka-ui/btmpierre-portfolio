# contact-handler (Telegram)

This Supabase Edge Function receives contact payloads from the frontend and forwards them to Telegram.

## Required secrets

Set secrets in your Supabase project:

- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID

Example:

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=xxxxx TELEGRAM_CHAT_ID=yyyyy
```

## Deploy

```bash
supabase functions deploy contact-handler
```

## Expected request shape

The frontend sends:

```json
{
  "payload": {
    "provider": "telegram",
    "type": "contact",
    "timestamp": "2026-03-26T12:00:00.000Z",
    "text": "Nouveau message portfolio..."
  }
}
```

If `text` is missing, a fallback message is generated from `payload.contact` or `payload.booking`.