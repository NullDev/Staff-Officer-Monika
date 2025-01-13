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
 * Send success message
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 * @param {String} username
 * @return {Promise<import("discord.js").Message>}
 */
const sendScucessMessage = async function(interaction, username){
    const channel = /** @type {import("discord.js").TextChannel} */ (
        await interaction.guild?.channels.fetch(interaction.channelId || "")?.catch(() => null)
    );

    const embed = new EmbedBuilder()
        .setTitle("Verification Successful")
        .setDescription(`You have successfully been verified as ${username}!`)
        .setColor(defaults.embed_color);

    return await channel.send({
        content: `<@${interaction.member?.user.id}>`,
        embeds: [embed],
    });
};

/**
 * Send error message
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 * @param {String} message
 * @return {Promise<import("discord.js").Message>}
 */
const sendErrorMessage = async function(interaction, message){
    const channel = /** @type {import("discord.js").TextChannel} */ (
        await interaction.guild?.channels.fetch(interaction.channelId || "")?.catch(() => null)
    );

    const embed = new EmbedBuilder()
        .setTitle("Verification Failed")
        .setDescription(message)
        .setColor(defaults.embed_color);

    return await channel.send({
        content: `<@${interaction.member?.user.id}>`,
        embeds: [embed],
    });
};

/**
 * Handle verification
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 * @return {Promise<import("discord.js").Message>}
 */
const handleVerification = async function(interaction){
    const username = interaction.fields.getTextInputValue("username");
    const clan = interaction.fields.getTextInputValue("clan");
    const gMember = /** @type {import("discord.js").GuildMember} */ (interaction.member);
    const memberRole = await interaction.guild?.roles.fetch()
        .then(roles => roles.find(r => r.name === "Member")).catch(() => null);

    if (!memberRole) return await sendErrorMessage(interaction, "Member role not found. Please contact the server owner.");

    if (clan.toLowerCase() === "none"){
        await gMember?.setNickname(username).catch(() => null);
        await gMember?.roles.add(memberRole).catch(() => null);

        return await sendScucessMessage(interaction, username);
    }

    const clanRoles = (await db.get(`guild-${interaction.guildId}.clan_roles`)) ?? [];
    const serverRoles = await interaction.guild?.roles.fetch().catch(() => null);

    const role = serverRoles?.find(r => r.name.toLowerCase() === clan.toLowerCase() && clanRoles.includes(r.id));

    if (!role) return await sendErrorMessage(interaction, "This clan does not exist here. Please contact the server owner to add it.");

    await gMember?.roles.add(role).catch(() => null);

    const name = `[${clan}] ${username}`;
    await gMember.setNickname(name).catch(() => null);

    await gMember.roles.add(memberRole).catch(() => null);

    return await sendScucessMessage(interaction, name);
};

export default handleVerification;
