import path from "node:path";
import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
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
        .setDescription("Set the channel to send verify logs too.")
        .setContexts([InteractionContextType.Guild])
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option.setName("channel")
                .setDescription("The channel to send the logs to.")
                .setRequired(true)),

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction){
        const channel = interaction.options.get("channel");
        if (!channel){
            return await interaction.reply({
                content: "A channel is required.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        let val = String(channel.value)?.match(/^<#(\d+)>$/)?.[1];

        if (!val) val = (await interaction.guild?.channels.fetch().catch(() => null))?.find(ch => ch?.name === channel.value && ch?.type === ChannelType.GuildText)?.id;
        if (!val){
            return await interaction.reply({
                content: "I can't find the specified channel.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        await db.set(`guild-${interaction.guildId}.log_channel`, val);

        return await interaction.reply({
            content: "Log channel has been sent to <#" + val + ">",
            flags: [MessageFlags.Ephemeral],
        });
    },
};
