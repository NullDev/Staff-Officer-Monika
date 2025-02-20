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
        .setDescription("Set the role for guests without clan")
        .setContexts([InteractionContextType.Guild])
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption((option) =>
            option.setName("role")
                .setDescription("The role to add as guest role.")
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

        const oldRole = (await db.get(`guild-${interaction.guildId}.guest_role`)) ?? null;
        if (oldRole && oldRole === role.id){
            return await interaction.reply({
                content: `Role "${role.name}" is already the guest role.`,
                flags: [MessageFlags.Ephemeral],
            });
        }

        await db.set(`guild-${interaction.guildId}.guest_role`, role.id);

        return await interaction.reply({
            content: `Role "${role.name}" has been set as guest role.`,
            flags: [MessageFlags.Ephemeral],
        });
    },
};
