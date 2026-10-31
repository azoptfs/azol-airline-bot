const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');
const db = require('../../database/db.js');

function buildManifestEmbed(flightNum, crewMap) {
    let manifestText = "```\n" + String("User").padEnd(18) + " | " + String("Role").padEnd(15) + "\n";
    manifestText += "-------------------------------------\n";
    if (crewMap.size === 0) {
        manifestText += "No crew assigned yet. / Não há tripulação.\n";
    } else {
        crewMap.forEach((role, username) => {
            manifestText += `${username.substring(0, 18).padEnd(18)} | ${role.substring(0, 15).padEnd(15)}\n`;
        });
    }
    manifestText += "```";

    return new EmbedBuilder()
        .setTitle(`LIVE UPDATES - FLIGHT ${flightNum}`)
        .setDescription(manifestText)
        .setColor(0x0099FF)
        .setFooter({ text: "Azol Linhas Aéreas • Updates Live", iconURL: config.LOGO_URL });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('manifest')
        .setDescription('Manage live crew assignment tables')
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Add a user to the live flight manifest')
            .addUserOption(o => o.setName('user').setDescription('Staff member to add').setRequired(true))
            .addStringOption(o => o.setName('role').setDescription('Assigned crew role').setRequired(true))
        ),

    async execute(interaction) {
        const isExec = interaction.member.roles.cache.has(config.ROLES.EXECUTIVE) || interaction.member.roles.cache.has(config.ROLES.NETWORK_MANAGER);
        if (!isExec) return interaction.reply({ content: "❌ Unauthorized.", ephemeral: true });
        if (!interaction.channel.isThread()) return interaction.reply({ content: "❌ Must be run inside a signup thread.", ephemeral: true });

        const activeManifest = db.manifests.get(interaction.channel.id);
        if (!activeManifest) return interaction.reply({ content: "❌ No active tracking metrics mapping to this thread instance.", ephemeral: true });

        const targetUser = interaction.options.getUser('user');
        const roleString = interaction.options.getString('role');

        activeManifest.crew.set(targetUser.username, roleString);

        const userQuota = db.getOrCreateUser(targetUser.id);
        userQuota.flightsAttended += 1;
        userQuota.passedThisWeek = true;

        const liveEmbed = buildManifestEmbed(activeManifest.flightNum, activeManifest.crew);
        const targetMessage = await interaction.channel.messages.fetch(activeManifest.manifestMsgId);
        await targetMessage.edit({ embeds: [liveEmbed] });

        return interaction.reply({ content: `Registered **${targetUser.username}** as **${roleString}**.`, ephemeral: true });
    }
};
