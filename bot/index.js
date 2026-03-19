require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// Config
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role for writes
const supabase = createClient(supabaseUrl, supabaseKey);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🤖 Bot logged in as ${client.user.tag}`);
});

let lastUpdateTimestamp = 0;
const COOLDOWN_MS = 5000; // 5 seconds cooldown
const MAX_PROJECTS = 20;

function clampProjects(value) {
    return Math.max(0, Math.min(MAX_PROJECTS, value));
}

function parseStatusCommand(content) {
    const normalized = content.trim();

    const statusWithProjects = normalized.match(/^!status\s+(available|busy)\s+projects=(\d{1,2})$/i);
    if (statusWithProjects) {
        return {
            isAvailable: statusWithProjects[1].toLowerCase() === 'available',
            activeProjects: clampProjects(parseInt(statusWithProjects[2], 10)),
            command: 'status-with-projects'
        };
    }

    const onlyProjects = normalized.match(/^!projects\s+(\d{1,2})$/i);
    if (onlyProjects) {
        return {
            activeProjects: clampProjects(parseInt(onlyProjects[1], 10)),
            command: 'projects-only'
        };
    }

    const onlyAvailability = normalized.match(/^!availability\s+(available|busy)$/i);
    if (onlyAvailability) {
        return {
            isAvailable: onlyAvailability[1].toLowerCase() === 'available',
            command: 'availability-only'
        };
    }

    return null;
}

client.on('messageCreate', async (message) => {
    // 1. Safety Checks: Only listen to the target channel, ignore bots, and VERIFY AUTHOR
    const isTargetChannel = message.channelId === process.env.DISCORD_STATUS_CHANNEL_ID;
    const isAllowedUser = message.author.id === process.env.ALLOWED_USER_ID;

    if (!isTargetChannel || message.author.bot || !isAllowedUser) return;

    // 2. Anti-Spam (Cooldown)
    const now = Date.now();
    if (now - lastUpdateTimestamp < COOLDOWN_MS) {
        console.warn('⚠️ Cooldown active. Skipping update.');
        await message.react('⏳');
        return;
    }

    const parsedCommand = parseStatusCommand(message.content);
    if (!parsedCommand) {
        await message.react('❔');
        return;
    }

    try {
        // 3. Fetch current state to handle partial updates
        const { data: currentStatus } = await supabase
            .from('portfolio_status')
            .select('*')
            .eq('id', 1)
            .single();

        let activeProjects = currentStatus ? currentStatus.active_projects : 0;
        let isAvailable = currentStatus ? currentStatus.is_available : true;

        // 4. Apply parsed command changes
        if (typeof parsedCommand.activeProjects === 'number') {
            activeProjects = parsedCommand.activeProjects;
        }
        if (typeof parsedCommand.isAvailable === 'boolean') {
            isAvailable = parsedCommand.isAvailable;
        }

        const auditLog = {
            event: 'status_update',
            command: parsedCommand.command,
            actorId: message.author.id,
            channelId: message.channelId,
            messageId: message.id,
            activeProjects,
            isAvailable,
            at: new Date().toISOString()
        };
        console.info('AUDIT_STATUS_UPDATE', JSON.stringify(auditLog));

        console.log(`📝 Updating status: ${activeProjects} projects, Available: ${isAvailable}`);

        // 5. Upsert to Supabase
        const { error } = await supabase
            .from('portfolio_status')
            .upsert({
                id: 1,
                active_projects: activeProjects,
                is_available: isAvailable,
                last_update: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) throw error;

        lastUpdateTimestamp = Date.now();
        console.log('✅ Supabase updated successfully (Upsert)');
        await message.react('✅');
    } catch (err) {
        console.error('❌ Error updating Supabase:', err.message);
        // Generic reaction for error to avoid information leakage in chat
        await message.react('❌');
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
