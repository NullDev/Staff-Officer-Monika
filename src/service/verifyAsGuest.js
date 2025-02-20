import path from "node:path";
import { EmbedBuilder } from "discord.js";
import { QuickDB } from "quick.db";
import defaults from "../util/defaults.js";
import { config } from "../../config/config.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const db = new QuickDB({
    filePath: path.resolve("./data/guild_data.sqlite"),
});

/**
 * Remove all clan roles from member
 *
 * @param {import("discord.js").ButtonInteraction} interaction
 * @return {Promise<any>}
 */
const removeAllClanRolesFromMember = async function(interaction){
    const clanRoles = (await db.get(`guild-${interaction.guildId}.clan_roles`)) ?? [];
    const serverRoles = await interaction.guild?.roles.fetch().catch(() => null);
    const { member } = interaction;

    if (!serverRoles || !member) return;

    for (const role of serverRoles.values()){
        if (clanRoles.includes(role.id)){
            await /** @type {import("discord.js").GuildMemberRoleManager} */ (member.roles).remove(role).catch(() => null);
        }
    }
};

/**
 * Send the verification modal
 *
 * @param {import("discord.js").ButtonInteraction} interaction
 * @return {Promise<void|null>}
 */
const verifyAsGuest = async function(interaction){
    await interaction.deferReply();

    const serverRole = await interaction.guild?.roles.fetch()
        .then(roles => roles.find(r => r.name === config.settings.guest_role)).catch(() => null);

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

    await removeAllClanRolesFromMember(interaction);

    const memberRole = await interaction.guild?.roles.fetch()
        .then(roles => roles.find(r => r.name === config.settings.member_role)).catch(() => null);

    if (memberRole) await /** @type {import("discord.js").GuildMemberRoleManager} */ (interaction.member?.roles)?.remove(memberRole);
    await /** @type {import("discord.js").GuildMember} */ (interaction.member)?.setNickname(null).catch(() => null);
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
