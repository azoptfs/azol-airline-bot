const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');
const db = require('../../database/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quota-reset')
        .setDescription('Clear an individual\'s accumulated quota strike history')
        .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true)),

    async execute(interaction) {
        const isExec = interaction.member.roles.cache.has(config.ROLES.EXECUTIVE) || interaction.member.roles.cache.has(config.ROLES.NETWORK_MANAGER);
        if (!isExec) return interaction.reply({ content: "❌ Unauthorized.", ephemeral: true });

        const u = interaction.options.getUser('user');
        const data = db.getOrCreateUser(u.id);
        data.strikes = 0;

        return interaction.reply({ content: `Amnesty cleared strike metrics for ${u.tag}.`, ephemeral: true });
    }
};
