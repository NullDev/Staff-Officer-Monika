import { SlashCommandBuilder, InteractionContextType, MessageFlags } from "discord.js";
import translations from "../../../locales/translations.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const commandName = import.meta.url.split("/").pop()?.split(".").shift() ?? "";

export default {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription(translations.help.desc)
        .setDescriptionLocalizations(translations.help.translations)
        .setContexts([InteractionContextType.Guild]),
    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction){
        const userCommands = /** @type {import("../../service/client.js").default} */ (interaction.client)
            .commands.filter(cmd => cmd.data.default_member_permissions !== "8");

        const str = await Promise.all(userCommands.map(async(cmd) => `**/${cmd.data.name}** - ${cmd.data.description}`));

        const preamble = "Here is a list of available commands:";
        return await interaction.reply({
            content: preamble + "\n\n" + str.join("\n"),
            flags: [MessageFlags.Ephemeral],
        });
    },
};
