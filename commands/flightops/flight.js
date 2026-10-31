const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flight')
        .setDescription('Post a public flight announcement')
        .addStringOption(o => o.setName('number').setDescription('Flight Number').setRequired(true))
        .addStringOption(o => o.setName('from').setDescription('Departure Airport').setRequired(true))
        .addStringOption(o => o.setName('to').setDescription('Arrival Airport').setRequired(true))
        .addStringOption(o => o.setName('time').setDescription('Raw time (e.g., 18:30)').setRequired(true))
        .addStringOption(o => o.setName('gate').setDescription('Departure Gate').setRequired(true)),
        
    async execute(interaction) {
        const isExec = interaction.member.roles.cache.has(config.ROLES.EXECUTIVE) || interaction.member.roles.cache.has(config.ROLES.NETWORK_MANAGER);
        if (!isExec) return interaction.reply({ content: "❌ Unauthorized access.", ephemeral: true });

        // Logic goes here...
        return interaction.reply({ content: "Flight broadcasted.", ephemeral: true });
    }
};
