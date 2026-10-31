const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');
const db = require('../../database/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unblacklist')
        .setDescription('Reverse profile lockdown metrics completely')
        .addUserOption(o => o.setName('user').setDescription('Target to restore').setRequired(true)),

    async execute(interaction) {
        const isFounder = interaction.member.roles.cache.has(config.ROLES.FOUNDER);
        if (!isFounder) return interaction.reply({ content: "❌ Requires Founder status.", ephemeral: true });

        const targetMember = interaction.options.getMember('user');
        if (!targetMember) return interaction.reply({ content: "❌ Target outside cached guild footprint.", ephemeral: true });

        await targetMember.roles.remove(config.ROLES.BLACKLISTED);
        const originalRoles = db.backups.get(targetMember.id) || [];

        for (const rId of originalRoles) {
            try { await targetMember.roles.add(rId); } catch {}
        }

        db.backups.delete(targetMember.id);
        return interaction.reply({ content: `✅ Recovered original user role configuration index matrix for ${targetMember.user.tag}.`, ephemeral: true });
    }
};
