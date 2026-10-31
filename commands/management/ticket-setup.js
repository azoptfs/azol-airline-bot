const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Deploy permanent clean bilingual service hub'),

    async execute(interaction) {
        const isExec = interaction.member.roles.cache.has(config.ROLES.EXECUTIVE) || interaction.member.roles.cache.has(config.ROLES.NETWORK_MANAGER);
        if (!isExec) return interaction.reply({ content: "❌ Unauthorized.", ephemeral: true });

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Azol Customer Support / Central de Ajuda", iconURL: config.LOGO_URL })
            .setTitle("🎫 SUPPORT HUB • CENTRAL DE ATENDIMENTO")
            .setDescription(
                `🇬🇧 **English:** Need support? Select the appropriate category from the menu below to connect directly with our support teams.\n\n` +
                `🇧🇷 **Português:** Precisa de suporte? Escolha a categoria correspondente no menu de seleção abaixo para abrir um canal de atendimento direto.`
            )
            .setColor(0x00247D);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_hub_select')
            .setPlaceholder('Choose a department / Selecione o departamento')
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel('🌐 General Support / Suporte Geral').setValue('ticket_general').setDescription('Passenger support / Ajuda geral'),
                new StringSelectMenuOptionBuilder().setLabel('🤝 Partnerships / Parcerias').setValue('ticket_partner').setDescription('PR & Marketing / Relações Públicas'),
                new StringSelectMenuOptionBuilder().setLabel('🚨 Reporting / Denúncias').setValue('ticket_report').setDescription('Secure rule-breaker channel'),
                new StringSelectMenuOptionBuilder().setLabel('💼 Contact Executives / Contatar Executivos').setValue('ticket_exec').setDescription('High security / Alto escalão')
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.channel.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: "✅ Ticket system hub online.", ephemeral: true });
    }
};
