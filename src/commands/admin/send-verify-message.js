import path from "node:path";
import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    MessageFlags,
    InteractionContextType,
    EmbedBuilder,
} from "discord.js";
import { QuickDB } from "quick.db";
import defaults from "../../util/defaults.js";

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
        .setDescription("Send the verify prompt + verify btn to a specific channel. (OLD MESSAGE WILL BE DELETED)")
        .setContexts([InteractionContextType.Guild])
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option.setName("channel")
                .setDescription("The channel to send the message to.")
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

        const ch = /** @type {import("discord.js").TextChannel} */ (await interaction.guild?.channels.fetch(val).catch(() => null));
        if (!ch){
            return await interaction.reply({
                content: "I can't find the specified channel.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        const embed = new EmbedBuilder()
            .setColor(defaults.embed_color)
            .setTitle("🔷┃Verification")
            .setDescription("### Hello Commander!\nTo gain access to the server, please **click the button** below and **fill out the form**.")
            .setImage("attachment://upsell.jpg")
            .setFooter({
                text: "If you have any questions, please ask a staff member or the owner.",
                iconURL: "attachment://icon.jpg",
            });

        const message = await ch.send({
            files: [
                {
                    attachment: "assets/banner-crop.jpg",
                    name: "banner-crop.jpg",
                },
                {
                    attachment: "assets/upsell.jpg",
                    name: "upsell.jpg",
                },
                {
                    attachment: "assets/icon.jpg",
                    name: "icon.jpg",
                },
            ],
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 1,
                            label: "Verify",
                            custom_id: "verify",
                        },
                    ],
                },
            ],
        });

        const oldMessage = await db.get(`guild-${interaction.guildId}.verify_message`);
        if (oldMessage){
            await ch.messages.delete(oldMessage).catch(() => null);
        }

        await db.set(`guild-${interaction.guildId}.verify_message`, message.id);

        const res = "Message has been sent to <#" + val + ">";
        return interaction.deferred
            ? await interaction.followUp({
                content: res,
                flags: [MessageFlags.Ephemeral],
            })
            : await interaction.reply({
                content: res,
                flags: [MessageFlags.Ephemeral],
            });
    },
};
