import cron from "node-cron";
import Log from "../util/log.js";
import LogHandler from "../crons/removeOldLogs.js";
import removeMissingRoles from "../crons/removeMissingRoles.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

/**
 * Schedule all crons
 *
 * @param {import("../service/client.js").default} client
 */
const scheduleCrons = async function(client){
    // hourly cron
    cron.schedule("0 * * * *", async() => {
        await removeMissingRoles(client);
    });

    // daily cron
    cron.schedule("0 0 * * *", async() => {
        await LogHandler.removeOldLogs();
    });

    const cronCount = cron.getTasks().size;
    Log.done("Scheduled " + cronCount + " Crons.");

    // start jobs on init
    await removeMissingRoles(client);
    await LogHandler.removeOldLogs();
};

export default scheduleCrons;
