import path from "node:path";
import { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } from "discord.js";
import { QuickDB } from "quick.db";
import createYesNoInteraction from "../../events/yesNoInteraction.js";

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
        await interaction.deferReply();

        const members = await interaction.guild?.members.fetch().catch(() => null);
        if (!members){
            return await interaction.followUp({
                content: "Failed to fetch members.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        const roles = await db.get(`guild-${interaction.guildId}.clan_roles`);
        const usersToSync = [];

        for await (const member of members.values()){
            const role = member.roles.cache.find(r => roles.includes(r.id));
            if (!role) continue;

            const username = member.nickname ?? member.displayName;
            const tag = role.name;

            if (username.toLowerCase().startsWith(`[${tag.toLowerCase()}]`)) continue;

            usersToSync.push({
                member,
                name: `[${tag}] ${username}`,
            });
        }

        if (!usersToSync.length){
            return await interaction.followUp({
                content: "All member nicknames are already synced with their clan tags.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        return createYesNoInteraction(interaction, {
            promptText: `Warning: This will change the nicknames of ${usersToSync.length} members. Do you want to proceed?`,
            showNoFirst: true,
        }).then(async(answer) => {
            if (answer === "yes"){
                usersToSync.forEach(async({ member, name }) => {
                    await member.setNickname(name).catch(() => null);
                });

                return await interaction.editReply({
                    content: "Synced all member nicknames with their clan tags.",
                });
            }

            if (answer === "no"){
                return await interaction.editReply({
                    content: "Aborted.",
                });
            }

            return null;
        });
    },
};
