const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const db = require('../database/db.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle Button Press (End Flight)
        if (interaction.isButton() && interaction.customId.startsWith('end_flight_')) {
            const flightNum = interaction.customId.replace('end_flight_', '');
            const isExec = interaction.member.roles.cache.has(config.ROLES.EXECUTIVE) || interaction.member.roles.cache.has(config.ROLES.NETWORK_MANAGER);

            if (!isExec) return interaction.reply({ content: "❌ Unauthorized to seal manifests.", ephemeral: true });

            await interaction.deferReply({ ephemeral: true });

            const thread = interaction.channel.threads?.cache.find(t => t.name.includes(flightNum)) || interaction.channel;
            if (thread.isThread()) {
                await thread.setName(`[CLOSED] Flight ${flightNum}`);
                await thread.setLocked(true);
                await thread.setArchived(true);

                const activeManifest = db.manifests.get(thread.id);
                if (activeManifest) {
                    const logsChan = interaction.guild.channels.cache.get(config.CHANNELS.QUOTA_LOGS);

                    for (const [username, role] of activeManifest.crew) {
                        const foundUser = interaction.guild.members.cache.find(m => m.user.username === username);
                        if (foundUser) {
                            const data = db.getOrCreateUser(foundUser.id);
                            data.passedThisWeek = true;

                            if (logsChan) {
                                await logsChan.send({
                                    content: `✅ **Quota Met / Quota Cumprida**\n🇬🇧 Congrats <@${foundUser.id}> for completing your flight tracking metric on Flight ${flightNum}!\n🇧🇷 Parabéns <@${foundUser.id}> por cumprir sua meta de voo no Voo ${flightNum}!`
                                });
                            }
                        }
                    }
                }
            }
            return interaction.editReply({ content: "🏁 Ops room sealed. Signups closed and tracking arrays logged." });
        }

        // Handle String Select Menu (Tickets)
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_hub_select') {
            await interaction.deferReply({ ephemeral: true });

            const type = interaction.values[0];
            const user = interaction.user;
            const guild = interaction.guild;

            let channelName = `${type.replace('ticket_', '')}-${user.username}`;
            let permissionOverwrites = [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ];

            if (type === 'ticket_exec') {
                permissionOverwrites.push({ id: config.ROLES.EXECUTIVE, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
            } else {
                permissionOverwrites.push({ id: config.ROLES.STAFF, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
            }

            const ticketChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: config.CHANNELS.TICKET_CATEGORY,
                permissionOverwrites: permissionOverwrites
            });

            const welcomeEmbed = new EmbedBuilder()
                .setTitle("🎫 TICKET FILE INITIALISED / ATENDIMENTO INICIADO")
                .setDescription(`🇬🇧 Welcome <@${user.id}>. Support will arrive shortly.\n🇧🇷 Bem-vindo <@${user.id}>. A equipe de suporte chegará em breve.`)
                .setColor(0x00FF66);

            await ticketChannel.send({ embeds: [welcomeEmbed] });
            return interaction.editReply({ content: `🎯 Ticket created safely here: ${ticketChannel}` });
        }
    }
};
