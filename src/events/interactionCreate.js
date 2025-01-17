import path from "node:path";
import { MessageFlags } from "discord.js";
import { QuickDB } from "quick.db";
import sendVerifyModal from "../service/sendVerifyModal.js";
import handleVerification from "../service/handleVerification.js";
import listClanRoles from "./listClanRolesBtn.js";
import Log from "../util/log.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const statDb = new QuickDB({
    filePath: path.resolve("./data/cmd_stats.sqlite"),
});

/**
 * Handle command Interaction events
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 * @return {Promise<void>}
 */
const handleCommandInteraction = async function(interaction){
    const command = /** @type {import("../service/client.js").default} */ (interaction.client)
        .commands.get(interaction.commandName);

    if (!command){
        Log.warn(`No command matching ${interaction.commandName} was found.`);
        await interaction.reply({
            content: `I don't seem to know the command ${interaction.commandName} =(`,
            flags: [MessageFlags.Ephemeral],
        });
        return;
    }

    try {
        await statDb.add(interaction.commandName, 1);
        await command.execute(interaction);
    }
    catch (error){
        Log.error("Error during command execution: ", error);
        if (interaction.replied || interaction.deferred){
            await interaction.followUp({
                content: "There was an error while executing this command! =(",
                flags: [MessageFlags.Ephemeral],
            });
        }
        else {
            await interaction.reply({
                content: "There was an error while executing this command! =(",
                flags: [MessageFlags.Ephemeral],
            });
        }
    }
};

/**
 * Handle modal submit events
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 */
const handleModalSubmit = async function(interaction){
    if (interaction.customId === "submit_into"){
        await handleVerification(interaction);
    }
};

/**
 * Handle button events
 *
 * @param {import("discord.js").ButtonInteraction} interaction
 */
const handleButton = async function(interaction){
    if (interaction.customId === "verify"){
        await sendVerifyModal(interaction);
    }

    if (interaction.customId === "list_clans"){
        await listClanRoles(interaction);
    }
};

/**
 * Handle interactionCreate event
 *
 * @param {import("discord.js").Interaction} interaction
 * @return {Promise<void>}
 */
const interactionCreateHandler = async function(interaction){
    if (interaction.isChatInputCommand()) await handleCommandInteraction(interaction);
    if (interaction.isModalSubmit()) await handleModalSubmit(interaction);
    if (interaction.isButton()) await handleButton(interaction);
};

export default interactionCreateHandler;
