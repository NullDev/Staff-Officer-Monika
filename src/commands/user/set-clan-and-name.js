import path from "node:path";
import {
    SlashCommandBuilder,
    MessageFlags,
    InteractionContextType,
} from "discord.js";
import { QuickDB } from "quick.db";
import gLogger from "../../service/gLogger.js";
import { config } from "../../../config/config.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const db = new QuickDB({
    filePath: path.resolve("./data/guild_data.sqlite"),
});

const commandName = import.meta.url.split("/").pop()?.split(".").shift() ?? "";

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
        const clan = String(interaction.options.get("clan")?.value);
        const name = String(interaction.options.get("name")?.value);
        const gMember = /** @type {import("discord.js").GuildMember} */ (interaction.member);

        if (!clan || !name){
            return await interaction.reply({
                content: "Both clan and name are required.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        const memberRole = await interaction.guild?.roles.fetch()
            .then(roles => roles.find(r => r.name === config.settings.member_role)).catch(() => null);
        const guestRole = await interaction.guild?.roles.fetch()
            .then(roles => roles.find(r => r.name === config.settings.guest_role)).catch(() => null);

        if (!memberRole){
            return await interaction.reply({
                content: "Member role not found. Please contact the server owner.",
                flags: [MessageFlags.Ephemeral],
            });
        }
        if (!guestRole){
            return await interaction.reply({
                content: "Guest role not found. Please contact the server owner.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        if (clan.toLowerCase() === "none"){
            await gMember?.setNickname(name).catch(() => null);
            await gMember?.roles.add(guestRole).catch(() => null);
            await gMember?.roles.remove(memberRole).catch(() => null);

            await gLogger(
                interaction,
                "🔷┃Verification Log - Success",
                `User ${interaction.user} has been verified as **"${name}"** without clan via command.`,
            );

            return await interaction.reply({
                content: `Your nickname has been set to "${name}".`,
                flags: [MessageFlags.Ephemeral],
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

            return await interaction.reply({
                content: eMsg,
                flags: [MessageFlags.Ephemeral],
            });
        }

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

        return await interaction.reply({
            content: `Your nickname has been set to "${newName}" and you have been given the role "${role.name}".`,
            flags: [MessageFlags.Ephemeral],
        });
    },
};
