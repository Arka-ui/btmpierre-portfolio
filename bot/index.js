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

client.on('messageCreate', async (message) => {
    // Only listen to the target channel and ignore bots
    if (message.channelId !== process.env.DISCORD_STATUS_CHANNEL_ID || message.author.bot) return;

    const content = message.content.toLowerCase();

    try {
        // 1. Fetch current state to handle partial updates
        const { data: currentStatus } = await supabase
            .from('portfolio_status')
            .select('*')
            .eq('id', 1)
            .single();

        let activeProjects = currentStatus ? currentStatus.active_projects : 0;
        let isAvailable = currentStatus ? currentStatus.is_available : true;

        // 2. Parse content for changes
        const projectsMatch = content.match(/[0-9]+/);
        if (projectsMatch) {
            activeProjects = parseInt(projectsMatch[0]);
        }

        if (content.includes('indisponible') || content.includes('busy') || content.includes('occupé') || content.includes('full') || content.includes('indispo')) {
            isAvailable = false;
        } else if (content.includes('disponible') || content.includes('dispo') || content.includes('available') || content.includes('libre')) {
            isAvailable = true;
        }

        console.log(`📝 Updating status: ${activeProjects} projects, Available: ${isAvailable}`);

        // 3. Upsert to Supabase
        const { error } = await supabase
            .from('portfolio_status')
            .upsert({
                id: 1,
                active_projects: activeProjects,
                is_available: isAvailable,
                last_update: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) throw error;
        console.log('✅ Supabase updated successfully (Upsert)');
        await message.react('✅');
    } catch (err) {
        console.error('❌ Error updating Supabase:', err.message);
        await message.react('❌');
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
