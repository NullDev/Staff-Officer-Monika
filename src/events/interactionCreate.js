import { MessageFlags } from "discord.js";
import Log from "../util/log.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

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
        () => {}; // noop
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
};

export default interactionCreateHandler;
