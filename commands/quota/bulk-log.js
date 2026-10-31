const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');
const db = require('../../database/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quota-bulk-log')
        .setDescription('Directly pass quota metrics for multiple targets')
        .addUserOption(o => o.setName('user1').setDescription('Staff member').setRequired(true))
        .addUserOption(o => o.setName('user2').setDescription('Staff member').setRequired(false))
        .addUserOption(o => o.setName('user3').setDescription('Staff member').setRequired(false)),

    async execute(interaction) {
        const isExec = interaction.member.roles.cache.has(config.ROLES.EXECUTIVE) || interaction.member.roles.cache.has(config.ROLES.NETWORK_MANAGER);
        if (!isExec) return interaction.reply({ content: "❌ Unauthorized.", ephemeral: true });

        const targets = [
            interaction.options.getUser('user1'),
            interaction.options.getUser('user2'),
            interaction.options.getUser('user3')
        ].filter(Boolean);

        targets.forEach(u => {
            const data = db.getOrCreateUser(u.id);
            data.passedThisWeek = true;
        });

        return interaction.reply({ content: `✅ Manual matrix updated for: ${targets.map(u => u.tag).join(', ')}`, ephemeral: true });
    }
};
