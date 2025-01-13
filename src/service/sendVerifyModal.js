import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const sendVerifyModal = async function(interaction){
    const modal = new ModalBuilder()
        .setCustomId("submit_into")
        .setTitle("Last War Information");

    const username = new TextInputBuilder()
        .setCustomId("username")
        .setStyle(TextInputStyle.Short)
        .setLabel("Your Last War Username")
        .setRequired(true);

    const clan = new TextInputBuilder()
        .setCustomId("clan")
        .setPlaceholder("TA5")
        .setStyle(TextInputStyle.Short)
        .setLabel("Clan Tag (If no clan, type \"none\")")
        .setRequired(true);

    const first = /** @type {ActionRowBuilder<import("discord.js").ModalActionRowComponentBuilder>} */ (new ActionRowBuilder()).addComponents(username);
    const second = /** @type {ActionRowBuilder<import("discord.js").ModalActionRowComponentBuilder>} */ (new ActionRowBuilder()).addComponents(clan);

    modal.addComponents(first, second);

    return await interaction.showModal(modal);
};

export default sendVerifyModal;
