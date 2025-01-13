import path from "node:path";
import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
    InteractionContextType,
} from "discord.js";
import { QuickDB } from "quick.db";

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
        .setDescription("Add an existing role as clan role.")
        .setContexts([InteractionContextType.Guild])
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption((option) =>
            option.setName("role")
                .setDescription("The role to add as clan role.")
                .setRequired(true)),

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction){
        const role = /** @type {import("discord.js").Role} */ (interaction.options.get("role")?.role);
        if (!role){
            return await interaction.reply({
                content: "A role is required.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        const roles = (await db.get(`guild-${interaction.guildId}.clan_roles`)) ?? [];
        if (roles.includes(role.id)){
            return await interaction.reply({
                content: `Role "${role.name}" is already a clan role.`,
                flags: [MessageFlags.Ephemeral],
            });
        }

        roles.push(role.id);
        await db.set(`guild-${interaction.guildId}.clan_roles`, roles);

        return await interaction.reply({
            content: `Role "${role.name}" has been added as clan role.`,
            flags: [MessageFlags.Ephemeral],
        });
    },
};
