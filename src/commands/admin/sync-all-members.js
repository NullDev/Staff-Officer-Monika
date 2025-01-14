import path from "node:path";
import { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } from "discord.js";
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
        .setDescription("Sync all member nicknames with their clan tags.")
        .setContexts([InteractionContextType.Guild])
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction){
        return await interaction.reply({
            content: "Not enabled yet.",
            flags: [MessageFlags.Ephemeral],
        });

        // eslint-disable-next-line no-unreachable
        await interaction.deferReply();

        const members = await interaction.guild?.members.fetch().catch(() => null);
        if (!members){
            return await interaction.followUp({
                content: "Failed to fetch members.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        const roles = await db.get(`guild-${interaction.guildId}.clan_roles`);

        for await (const member of members.values()){
            const role = member.roles.cache.find(r => roles.includes(r.id));
            if (!role) continue;

            const username = member.nickname ?? member.displayName;
            const tag = role.name;

            if (username.toLowerCase().startsWith(`[${tag.toLowerCase()}]`)) continue;
            await member.setNickname(`[${tag}] ${username}`).catch(() => null);
        }

        return await interaction.followUp({
            content: "Synced all member nicknames with their clan tags.",
            flags: [MessageFlags.Ephemeral],
        });
    },
};
