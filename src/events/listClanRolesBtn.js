import path from "node:path";
import { EmbedBuilder } from "discord.js";
import { QuickDB } from "quick.db";
import defaults from "../util/defaults.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const db = new QuickDB({
    filePath: path.resolve("./data/guild_data.sqlite"),
});

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

/**
 * Send message
 *
 * @param {import("discord.js").ButtonInteraction} interaction
 * @return {Promise<any>}
 */
const finalReminder = async function(interaction){
    const embed = new EmbedBuilder()
        .setTitle("List is on the way!")
        .setDescription("Check your DMs :)")
        .setColor(defaults.embed_color);

    if (!interaction.deferred && !interaction.replied) interaction.deferReply();

    return await interaction.editReply({
        content: `<@${interaction.member?.user.id}>`,
        embeds: [embed],
    }).then(msg => {
        setTimeout(async() => {
            await msg.delete().catch(() => null);
        }, defaults.msgDeleteTime);
    }).catch(() => null);
};

/**
 * Send the verification modal
 *
 * @param {import("discord.js").ButtonInteraction} interaction
 * @return {Promise<import("discord.js").Message>}
 */
const listClanRoles = async function(interaction){
    interaction.deferReply();

    const preamble = "Hello Commander! Seems like you requested a list of all clan roles.";

    const roles = await db.get(`guild-${interaction.guildId}.clan_roles`);
    if (!roles || roles.length === 0){
        const embed = new EmbedBuilder()
            .setColor(defaults.embed_color)
            .setTitle("🔷┃Clan List")
            .setDescription(preamble + "\nIt seems like there currently are no clan roles to list. Sorry!")
            .setTimestamp();

        await interaction.user.send({
            embeds: [embed],
        });
        return await finalReminder(interaction);
    }

    const promises = roles.map(async(roleid) => {
        const role = (await interaction.guild?.roles.fetch(roleid))?.name;
        if (!role){
            await db.delete(`guild-${interaction.guildId}.${roleid}`);
            return "";
        }
        return `- **${role}**`;
    });

    const replyString = (await Promise.all(promises)).filter(e => !!e).join("\n");

    const embed = new EmbedBuilder()
        .setColor(defaults.embed_color)
        .setTitle("🔷┃Clan List")
        .setDescription(preamble + "\nHere they are:\n\n" + replyString)
        .setThumbnail("attachment://icon.jpg")
        .setTimestamp();

    await interaction.user.send({
        embeds: [embed],
        files: [
            {
                attachment: "assets/icon.jpg",
                name: "icon.jpg",
            },
        ],
    });

    return await finalReminder(interaction);
};

export default listClanRoles;
