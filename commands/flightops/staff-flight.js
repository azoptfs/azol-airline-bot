const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');

function parseToHammertime(rawTime) {
    if (!isNaN(rawTime)) return `<t:${Math.floor(Number(rawTime))}:F> (<t:${Math.floor(Number(rawTime))}:R>)`;
    try {
        const [hours, minutes] = rawTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return `<t:${Math.floor(date.getTime() / 1000)}:F> (<t:${Math.floor(date.getTime() / 1000)}:R>)`;
    } catch {
        return rawTime;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flight')
        .setDescription('Post a public flight announcement')
        .addStringOption(o => o.setName('number').setDescription('Flight Number (e.g., AD1234)').setRequired(true))
        .addStringOption(o => o.setName('from').setDescription('Departure Airport').setRequired(true))
        .addStringOption(o => o.setName('to').setDescription('Arrival Airport').setRequired(true))
        .addStringOption(o => o.setName('time').setDescription('Raw time (e.g., 18:30)').setRequired(true))
        .addStringOption(o => o.setName('gate').setDescription('Departure Gate').setRequired(true)),

    async execute(interaction) {
        const isExec = interaction.member.roles.cache.has(config.ROLES.EXECUTIVE) || interaction.member.roles.cache.has(config.ROLES.NETWORK_MANAGER);
        if (!isExec) return interaction.reply({ content: "❌ Unauthorized access.", ephemeral: true });

        const timestamp = parseToHammertime(interaction.options.getString('time'));
        const embed = new EmbedBuilder()
            .setAuthor({ name: "Azol Linhas Aéreas", iconURL: config.LOGO_URL })
            .setTitle(`FLIGHT ARRANGEMENT / PROGRAMAÇÃO DE VÔO [${interaction.options.getString('number')}]`)
            .setDescription(
                `🇬🇧 **English:**\nA flight is commencing at ${timestamp} from **${interaction.options.getString('from')}** to **${interaction.options.getString('to')}** at gate **${interaction.options.getString('gate')}**.\nThe server link is as follows: [Click Here to Join](${config.SERVER_LINK})\n\n` +
                `🇧🇷 **Português:**\nUm voo está iniciando às ${timestamp} de **${interaction.options.getString('from')}** para **${interaction.options.getString('to')}** no portão **${interaction.options.getString('gate')}**.\nO link do servidor é o seguinte: [Clique Aqui para Entrar](${config.SERVER_LINK})`
            )
            .setColor(0x00FF66)
            .setThumbnail(config.LOGO_URL)
            .setTimestamp();

        const channel = interaction.guild.channels.cache.get(config.CHANNELS.PUBLIC_FLIGHTS);
        if (channel) {
            await channel.send({ embeds: [embed] });
            return interaction.reply({ content: "✅ Public flight layout successfully transmitted.", ephemeral: true });
        }
        return interaction.reply({ content: "❌ Public flight channel not found.", ephemeral: true });
    }
};
