import path from "node:path";
import { EmbedBuilder } from "discord.js";
import { QuickDB } from "quick.db";
import defaults from "../util/defaults.js";
import Log from "../util/log.js";
import gLogger from "./gLogger.js";
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
 * @param {import("discord.js").ModalSubmitInteraction} interaction
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
 * Send success message
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 * @param {String} username
 * @return {Promise<any>}
 */
const sendSuccessMessage = async function(interaction, username){
    const channel = /** @type {import("discord.js").TextChannel} */ (
        await interaction.guild?.channels.fetch(interaction.channelId || "")?.catch(() => null)
    );

    const embed = new EmbedBuilder()
        .setTitle("Verification Successful")
        .setDescription(`You have successfully been verified as ${username}!`)
        .setColor(defaults.embed_color);

    Log.done(`User ${interaction.user.displayName} has been verified as "${username}"`);

    await gLogger(
        interaction,
        "🔷┃Verification Log - Success",
        `User ${interaction.user} has been verified as **"${username}"** via modal.`,
    );

    return await channel.send({
        content: `<@${interaction.member?.user.id}>`,
        embeds: [embed],
    }).then(msg => {
        setTimeout(async() => {
            await msg.delete().catch(() => null);
        }, defaults.msgDeleteTime);
    }).catch(() => null);
};

/**
 * Send error message
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 * @param {String} message
 * @return {Promise<any>}
 */
const sendErrorMessage = async function(interaction, message){
    const channel = /** @type {import("discord.js").TextChannel} */ (
        await interaction.guild?.channels.fetch(interaction.channelId || "")?.catch(() => null)
    );

    const embed = new EmbedBuilder()
        .setTitle("Verification Failed")
        .setDescription(message)
        .setColor(defaults.embed_color);

    Log.error(`User ${interaction.user.displayName} failed verification: ${message}`);

    await gLogger(
        interaction,
        "🔷┃Verification Log - Error",
        `User ${interaction.user} **could NOT** be verified via modal:\n${message}`,
        "Red",
    );

    return await channel.send({
        content: `<@${interaction.member?.user.id}>`,
        embeds: [embed],
    }).then(msg => {
        setTimeout(async() => {
            await msg.delete().catch(() => null);
        }, defaults.msgDeleteTime);
    }).catch(() => null);
};

/**
 * Handle verification
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 * @return {Promise<import("discord.js").Message>}
 */
const handleVerification = async function(interaction){
    if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

    const username = interaction.fields.getTextInputValue("username");
    let clan = interaction.fields.getTextInputValue("clan");

    // @TODO: HARDCODED. CHANGE THIS
    // A lot of people get it wrong.
    if (clan.toLowerCase() === "mooo" || clan.toLowerCase() === "mood" || clan.toLowerCase() === "moood") clan = "Moo0";
    // -----------------------------

    const gMember = /** @type {import("discord.js").GuildMember} */ (interaction.member);
    const memberRole = await interaction.guild?.roles.fetch()
        .then(roles => roles.find(r => r.name === config.settings.member_role)).catch(() => null);
    const guestRole = await interaction.guild?.roles.fetch()
        .then(roles => roles.find(r => r.name === config.settings.guest_role)).catch(() => null);

    if (!memberRole) return await sendErrorMessage(interaction, "Member role not found. Please contact the server owner.");
    if (!guestRole) return await sendErrorMessage(interaction, "Guest role not found. Please contact the server owner.");

    if (clan.toLowerCase() === "none"){
        await removeAllClanRolesFromMember(interaction);
        await gMember?.setNickname(username).catch(() => null);
        await gMember?.roles.add(guestRole).catch(() => null);
        await gMember?.roles.remove(memberRole).catch(() => null);

        return await sendSuccessMessage(interaction, username);
    }

    const clanRoles = (await db.get(`guild-${interaction.guildId}.clan_roles`)) ?? [];
    const serverRoles = await interaction.guild?.roles.fetch().catch(() => null);

    const role = serverRoles?.find(r => r.name.toLowerCase() === clan.toLowerCase() && clanRoles.includes(r.id));

    if (!role) return await sendErrorMessage(interaction, `The clan role "${clan}" does not exist here. Please contact the server owner to add it.`);

    await removeAllClanRolesFromMember(interaction);
    await gMember?.roles.add(role).catch(() => null);

    const name = `[${clan}] ${username}`;
    await gMember.setNickname(name).catch(() => null);

    await gMember.roles.add(memberRole).catch(() => null);
    await gMember.roles.remove(guestRole).catch(() => null);

    return await sendSuccessMessage(interaction, name);
};

export default handleVerification;
