export const config = {
    supabaseUrl: 'https://zmchaconehlzbgaqrxrx.supabase.co',
    supabaseAnonKey: 'sb_publishable_MqrNea_R3h4zjPPS00o6iA_LhSXEBgx',
    githubUsername: 'nexos20lv',
    discordId: '1288079115248992297',
    endpoints: {
        lanyardSocket: 'wss://api.lanyard.rest/socket',
        discordAppRpc: 'https://discord.com/api/v9/oauth2/applications',
        githubApi: 'https://api.github.com'
    },
    retries: {
        maxDelayMs: 30000,
        baseDelayMs: 1200
    },
    perf: {
        lowEndDeviceMemoryGb: 4,
        lowEndCpuThreads: 4,
        lowEndViewportWidth: 900
    }
};
