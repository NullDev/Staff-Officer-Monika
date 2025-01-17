import path from "node:path";
import { SlashCommandBuilder, InteractionContextType, EmbedBuilder, MessageFlags } from "discord.js";
import { QuickDB } from "quick.db";
import gLogger from "../../service/gLogger.js";
import { config } from "../../../config/config.js";
import defaults from "../../util/defaults.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const db = new QuickDB({
    filePath: path.resolve("./data/guild_data.sqlite"),
});

const commandName = import.meta.url.split("/").pop()?.split(".").shift() ?? "";

/**
 * Remove all clan roles from member
 *
 * @param {import("discord.js").CommandInteraction} interaction
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

export default {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription("Set your clan and Last War nickname")
        .setContexts([InteractionContextType.Guild])
        .addStringOption((option) =>
            option.setName("clan")
                .setDescription("The clan you are in (or \"none\" if you are not in a clan).")
                .setRequired(true))
        .addStringOption((option) =>
            option.setName("name")
                .setDescription("Your Last War nickname.")
                .setRequired(true)),

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction){
        interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const clan = String(interaction.options.get("clan")?.value);
        const name = String(interaction.options.get("name")?.value);
        const gMember = /** @type {import("discord.js").GuildMember} */ (interaction.member);

        if (!clan || !name){
            return await interaction.editReply({
                content: "Both clan and name are required.",
            });
        }

        const replyEmbed = new EmbedBuilder()
            .setTitle("🔷┃Verification")
            .setTimestamp();

        const memberRole = await interaction.guild?.roles.fetch()
            .then(roles => roles.find(r => r.name === config.settings.member_role)).catch(() => null);
        const guestRole = await interaction.guild?.roles.fetch()
            .then(roles => roles.find(r => r.name === config.settings.guest_role)).catch(() => null);

        if (!memberRole){
            replyEmbed.setDescription("Member role not found. Please contact the server owner.")
                .setColor("Red");

            return await interaction.editReply({
                embeds: [replyEmbed],
            });
        }
        if (!guestRole){
            replyEmbed.setDescription("Guest role not found. Please contact the server owner.")
                .setColor("Red");

            return await interaction.editReply({
                embeds: [replyEmbed],
            });
        }

        if (clan.toLowerCase() === "none"){
            await removeAllClanRolesFromMember(interaction);

            await gMember?.setNickname(name).catch(() => null);
            await gMember?.roles.add(guestRole).catch(() => null);
            await gMember?.roles.remove(memberRole).catch(() => null);

            await gLogger(
                interaction,
                "🔷┃Verification Log - Success",
                `User ${interaction.user} has been verified as **"${name}"** without clan via command.`,
            );

            replyEmbed.setDescription(`Your nickname has been set to "${name}".`)
                .setColor(defaults.embed_color);

            return await interaction.editReply({
                embeds: [replyEmbed],
            });
        }

        const clanRoles = (await db.get(`guild-${interaction.guildId}.clan_roles`)) ?? [];
        const serverRoles = await interaction.guild?.roles.fetch().catch(() => null);

        const role = serverRoles?.find(r => r.name.toLowerCase() === clan.toLowerCase() && clanRoles.includes(r.id));

        if (!role){
            const eMsg = `The clan "${clan}" does not exist here. Please contact the server owner to add it.`;

            await gLogger(
                interaction,
                "🔷┃Verification Log - Error",
                `User ${interaction.user} **could NOT** be verified via command:\n${eMsg}`,
                "Red",
            );

            replyEmbed.setDescription(eMsg)
                .setColor("Red");

            return await interaction.editReply({
                embeds: [replyEmbed],
            });
        }

        await removeAllClanRolesFromMember(interaction);
        await gMember?.roles.add(role).catch(() => null);
        await gMember?.roles.add(memberRole).catch(() => null);
        await gMember?.roles.remove(guestRole).catch(() => null);

        const newName = `[${clan}] ${name}`;
        await gMember.setNickname(newName).catch(() => null);

        await gLogger(
            interaction,
            "🔷┃Verification Log - Success",
            `User ${interaction.user} has been verified as **"${newName}"** via command.`,
        );

        replyEmbed.setDescription(
            `Your nickname has been set to "${newName}" and you have been given the role "${role.name}".`,
        ).setColor(defaults.embed_color);

        return await interaction.editReply({
            embeds: [replyEmbed],
        });
    },
};
