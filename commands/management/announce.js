const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Masked executive notification engine')
        .addChannelOption(o => o.setName('channel').setDescription('Target channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addStringOption(o => o.setName('heading').setDescription('Title text').setRequired(true))
        .addStringOption(o => o.setName('text').setDescription('Body text').setRequired(true))
        .addStringOption(o => o.setName('ping').setDescription('Ping type target').setRequired(true).addChoices(
            { name: 'None', value: 'none' },
            { name: '@everyone', value: 'everyone' },
            { name: '@here', value: 'here' },
            { name: 'Other Role ID', value: 'other' }
        ))
        .addStringOption(o => o.setName('role-id').setDescription('Provide custom Role ID if choice was set to Other').setRequired(false)),

    async execute(interaction) {
        const isExec = interaction.member.roles.cache.has(config.ROLES.EXECUTIVE) || interaction.member.roles.cache.has(config.ROLES.NETWORK_MANAGER);
        if (!isExec) return interaction.reply({ content: "❌ Unauthorized access.", ephemeral: true });

        const targetChan = interaction.options.getChannel('channel');
        const heading = interaction.options.getString('heading');
        const text = interaction.options.getString('text');
        const pingType = interaction.options.getString('ping');
        const customRole = interaction.options.getString('role-id');

        let pingPrefix = "";
        if (pingType === 'everyone') pingPrefix = "@everyone";
        else if (pingType === 'here') pingPrefix = "@here";
        else if (pingType === 'other' && customRole) pingPrefix = `<@&${customRole}>`;

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Azol Linhas Aéreas", iconURL: config.LOGO_URL })
            .setTitle(heading)
            .setDescription(text)
            .setColor(0x00247D)
            .setThumbnail(config.LOGO_URL)
            .setTimestamp();

        await targetChan.send({ content: pingPrefix ? pingPrefix : undefined, embeds: [embed] });
        return interaction.reply({ content: "📢 Executive broadcast deployed cleanly.", ephemeral: true });
    }
};
