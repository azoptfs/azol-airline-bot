const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');
const db = require('../../database/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Full profile lockdown and role backing isolation')
        .addUserOption(o => o.setName('user').setDescription('Target to isolate').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Legal/Policy reasoning').setRequired(true)),

    async execute(interaction) {
        const isFounder = interaction.member.roles.cache.has(config.ROLES.FOUNDER);
        if (!isFounder) return interaction.reply({ content: "❌ Requires Founder status.", ephemeral: true });

        const targetMember = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason');
        if (!targetMember) return interaction.reply({ content: "❌ User not cached inside server.", ephemeral: true });

        const cacheRoles = targetMember.roles.cache.map(r => r.id).filter(id => id !== interaction.guild.id);
        db.backups.set(targetMember.id, cacheRoles);

        try {
            await targetMember.send({ content: `**Blacklist Notice / Aviso de Lista Negra**\n\n🇬🇧 You have been blacklisted from Azol Linhas Aéreas for: ${reason}\n🇧🇷 Você foi incluído na lista negra da Azol Linhas Aéreas por: ${reason}` });
        } catch {}

        for (const roleId of cacheRoles) {
            try { await targetMember.roles.remove(roleId); } catch {}
        }
        await targetMember.roles.add(config.ROLES.BLACKLISTED);

        const auditEmbed = new EmbedBuilder()
            .setTitle("🚨 BLACKLIST PROTOCOL EXECUTED")
            .setDescription(`Target: ${targetMember.user.tag}\nReason: ${reason}\nRoles Cached: ${cacheRoles.length}`)
            .setColor(0xFF0000)
            .setTimestamp();

        const logChan = interaction.guild.channels.cache.get(config.CHANNELS.STAFF_LOGS);
        if (logChan) await logChan.send({ embeds: [auditEmbed] });

        return interaction.reply({ content: `System isolation locked for ${targetMember.user.tag}.`, ephemeral: true });
    }
};
