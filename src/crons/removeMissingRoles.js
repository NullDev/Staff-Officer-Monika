import path from "node:path";
import { QuickDB } from "quick.db";
import Log from "../util/log.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const db = new QuickDB({
    filePath: path.resolve("./data/guild_data.sqlite"),
});

/**
 * Make sure database roles and guild roles are in sync
 *
 * @param {import("../service/client.js").default} client
 */
const removeMissingRoles = async(client) => {
    Log.wait("[CRON] Removing missing roles...");

    let removedGuilds = 0;
    let removedRoles = 0;

    const data = await db.all();
    if (!data) return;

    for (const dbGuild of data){
        const guildId = dbGuild.id.replace("guild-", "");

        const roles = dbGuild.value.clan_roles ?? [];

        for (const roleId of roles){
            const guild = await client.guilds.fetch(guildId).catch(() => null);
            if (!guild){
                await db.delete(`guild-${guildId}`);
                Log.info(`[CRON] Guild ${guildId} not found. Deleting from DB...`);
                ++removedGuilds;
                continue;
            }

            const role = await guild.roles.fetch(roleId).catch(() => null);
            if (!role){
                const newRoles = roles.filter((r) => r !== roleId).filter(e => !!e);

                await db.set(`guild-${guildId}.clan_roles`, newRoles);
                Log.info(`[CRON] Role ${roleId} not found in guild ${guildId}. Deleting from DB...`);
                ++removedRoles;
            }
        }
    }

    Log.done(`[CRON] Synced roles and shop. Removed ${removedGuilds} guilds and ${removedRoles} roles.`);
};

export default removeMissingRoles;
