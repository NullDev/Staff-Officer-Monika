import EventEmitter from "node:events";
import { ClusterManager } from "discord-hybrid-sharding";
import Log from "./util/log.js";
import { config, meta } from "../config/config.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

EventEmitter.defaultMaxListeners = 20;

const manager = new ClusterManager("./src/bot.js", {
    totalShards: config.discord.total_shards,
    shardsPerClusters: config.discord.shards_per_cluster,
    token: config.discord.bot_token,
});

const appname = meta.getName();
const version = meta.getVersion();
const author = meta.getAuthor();
const pad = 16 + appname.length + version.toString().length + author.length;

Log.raw(
    "\n" +
    " #" + "-".repeat(pad) + "#\n" +
    " # Started " + appname + " v" + version + " by " + author + " #\n" +
    " #" + "-".repeat(pad) + "#\n",
);

Log.info("--- START ---");
Log.info(appname + " v" + version + " by " + author);

Log.debug("Node Environment: " + process.env.NODE_ENV, true);
Log.debug("NodeJS version: " + process.version, true);
Log.debug("OS: " + process.platform + " " + process.arch, true);

manager.on("clusterCreate", shard => Log.info(`Launched shard ${shard.id}`));
if (process.env.NODE_ENV !== "production") manager.on("debug", e => Log.debug(e));

manager.spawn({ timeout: -1 });

process.on("unhandledRejection", (
    /** @type {Error} */ err,
) => Log.error("Unhandled promise rejection: ", err));
