import path from "node:path";
import { SlashCommandBuilder, MessageFlags, InteractionContextType } from "discord.js";
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
        .setDescription("List all clan roles.")
        .setContexts([InteractionContextType.Guild]),

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction){
        const roles = await db.get(`guild-${interaction.guildId}.clan_roles`);
        if (!roles || roles.length === 0){
            return await interaction.reply({
                content: "No clan roles have been found. Use `/add-clan-role` to add some.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        const promises = roles.map(async(roleid) => {
            const role = (await interaction.guild?.roles.fetch(roleid))?.name;
            if (!role){
                await db.delete(`guild-${interaction.guildId}.${roleid}`);
                return `Role with ID ${roleid} not found anymore. Deleted from database.`;
            }
            return `- **${role}**`;
        });

        const replyString = (await Promise.all(promises)).join("\n");

        return await interaction.reply({
            content: replyString,
            flags: [MessageFlags.Ephemeral],
        });
    },
};
