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

/**
 * Send the verification modal
 *
 * @param {import("discord.js").ButtonInteraction} interaction
 * @return {Promise<void|null>}
 */
const verifyAsGuest = async function(interaction){
    await interaction.deferReply();

    const role = await db.get(`guild-${interaction.guildId}.guest_role`);
    if (!role){
        const embed = new EmbedBuilder()
            .setColor(defaults.embed_color)
            .setTitle("🔷┃Guest role")
            .setDescription("It seems like there is no guest role set. Please contact an admin.")
            .setTimestamp();

        return await interaction.editReply({
            content: `<@${interaction.member?.user.id}>`,
            embeds: [embed],
        }).then(msg => {
            setTimeout(async() => {
                await msg.delete().catch(() => null);
            }, defaults.msgDeleteTime);
        }).catch(() => null);
    }

    const serverRole = await interaction.guild?.roles.fetch(role);
    if (!serverRole){
        const embed = new EmbedBuilder()
            .setColor(defaults.embed_color)
            .setTitle("🔷┃Guest role")
            .setDescription("It seems like the guest role is invalid. Please contact an admin.")
            .setTimestamp();

        return await interaction.editReply({
            content: `<@${interaction.member?.user.id}>`,
            embeds: [embed],
        }).then(msg => {
            setTimeout(async() => {
                await msg.delete().catch(() => null);
            }, defaults.msgDeleteTime);
        }).catch(() => null);
    }

    await /** @type {import("discord.js").GuildMemberRoleManager} */ (interaction.member?.roles)?.add(serverRole);

    const embed = new EmbedBuilder()
        .setTitle("Verified as guest")
        .setDescription("You have been verified as guest. You can always verify as a clan member later!")
        .setColor(defaults.embed_color);

    return await interaction.editReply({
        content: `<@${interaction.member?.user.id}>`,
        embeds: [embed],
    }).then(msg => {
        setTimeout(async() => {
            await msg.delete().catch(() => null);
        }, defaults.msgDeleteTime);
    }).catch(() => null);
};

export default verifyAsGuest;
