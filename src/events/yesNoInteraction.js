import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

/* eslint-disable no-param-reassign */

/**
 * Create a yes/no interaction
 *
 * @param {import("discord.js").CommandInteraction | import("discord.js").StringSelectMenuInteraction} interaction
 * @param {object} options
 * @returns {Promise<string>}
 */
const createYesNoInteraction = async function(interaction, {
    promptText = null,
    yesText = null,
    noText = null,
    yesStyle = ButtonStyle.Success,
    noStyle = ButtonStyle.Danger,
    showNoFirst = false,
    timeout = 60000,
}){
    promptText ??= "Are you sure?";
    yesText ??= "Yes";
    noText ??= "No";

    const yes = new ButtonBuilder()
        .setCustomId("yes")
        .setLabel(yesText)
        .setStyle(yesStyle);

    const no = new ButtonBuilder()
        .setCustomId("no")
        .setLabel(noText)
        .setStyle(noStyle);

    const row = showNoFirst
        ? new ActionRowBuilder().addComponents(no, yes)
        : new ActionRowBuilder().addComponents(yes, no);

    if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

    const response = await interaction.followUp({
        content: promptText,
        // @ts-ignore
        components: [row],
    });

    const collectorFilter = i => i.user.id === interaction.user.id;
    try {
        const confirmation = await response.awaitMessageComponent({
            filter: collectorFilter,
            time: timeout,
        });
        await response.edit({ components: [] });
        return confirmation.customId;
    }
    // eslint-disable-next-line no-unused-vars
    catch (e){
        await response.edit({ components: [] });
        await interaction.followUp({
            content: "Time ran out. Aborted.",
        });
        return "timeout";
    }
};

export default createYesNoInteraction;
