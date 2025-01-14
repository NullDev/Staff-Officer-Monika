import EventEmitter from "node:events";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { GatewayIntentBits, Events, ActivityType, Partials } from "discord.js";
import Log from "./util/log.js";
import { config } from "../config/config.js";
import DiscordClient from "./service/client.js";
import clientReady from "./events/clientReady.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

EventEmitter.defaultMaxListeners = 20;

const client = new DiscordClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
    ],
    presence: {
        status: "dnd",
        activities: [{ name: "Starting...", type: ActivityType.Playing }],
    },
    shards: getInfo().SHARD_LIST,
    shardCount: getInfo().TOTAL_SHARDS,
});

Log.wait("Starting bot...");

client.cluster = new ClusterClient(client);

client.on(Events.ClientReady, async() => clientReady(client));

client.on(Events.ShardReady, async shard => Log.info(`Shard ${shard} is ready!`));

client.on(Events.GuildCreate, async guild => Log.info("Joined guild: " + guild.name));

client.on(Events.GuildDelete, guild => Log.info("Left guild: " + guild.name));

client.on(Events.GuildUnavailable, guild => Log.warn("Guild is unavailable: " + guild.name));

client.on(Events.Warn, info => Log.warn(info));

client.on(Events.Error, err => Log.error("Client error.", err));

client.login(config.discord.bot_token)
    .then(() => Log.done("Logged in!"))
    .catch(err => Log.error("Failed to login: ", err));

process.on("unhandledRejection", (
    /** @type {Error} */ err,
) => Log.error("Unhandled promise rejection: ", err));
