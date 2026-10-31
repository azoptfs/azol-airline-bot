const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Azol Systems Online: Signed in as ${client.user.tag}`);

        const guild = client.guilds.cache.first();
        if (!guild) return console.log("⚠️ No guilds found to bind commands to.");

        const commandsData = client.commands.map(cmd => cmd.data.toJSON());
        await guild.commands.set(commandsData);
        console.log("✅ Command trees fully injected into guild application cache.");
    }
};
