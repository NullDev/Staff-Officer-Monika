# Staff Officer Monika
[![NullDev/DiscordJS-Template](https://img.shields.io/badge/Template%3A-NullDev%2FDiscordJS--Template-green?style=flat-square&logo=github)](https://github.com/NullDev/DiscordJS-Template) [![License](https://img.shields.io/github/license/NullDev/Staff-Officer-Monika?label=License&logo=Creative%20Commons)](https://github.com/NullDev/Staff-Officer-Monika/blob/master/LICENSE) [![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/NullDev/Staff-Officer-Monika?logo=Cachet)](https://github.com/NullDev/Staff-Officer-Monika/issues?q=is%3Aissue+is%3Aclosed)

<p align="center"><img height="250" width="auto" src="/assets/icon.jpg" /></p>
<p align="center"><b>Discord Bot to manage the #1128 Server members</b></p>
<hr>

## :question: What does it do?

This is just a discord bot to assign roles based on clan tags.

<hr>

## :diamond_shape_with_a_dot_inside: Feature requests & Issues

Feature request or discovered a bug? Please [open an Issue](https://github.com/NullDev/Staff-Officer-Monika/issues/new/choose) here on GitHub.

<hr>

## :wrench: Setup

0. Open up your favourite terminal (and navigate somewhere you want to download the repository to). <br><br>
1. Make sure you have NodeJS installed (>= v20.0.0). Test by entering <br>
$ `node -v` <br>
If this returns a version number, NodeJS is installed. **If not**, get NodeJS <a href="https://nodejs.org/en/download/package-manager/">here</a>. <br><br>
2. Clone the repository and navigate to it. If you have Git installed, type <br>
$ `git clone https://github.com/NullDev/Staff-Officer-Monika.git && cd Staff-Officer-Monika` <br>
If not, download it <a href="https://github.com/NullDev/Staff-Officer-Monika/archive/master.zip">here</a> and extract the ZIP file.<br>
Then navigate to the folder.<br><br>
3. Install all dependencies by typing <br>
$ `npm install`<br><br>
4. Copy [config/config.template.js](https://github.com/NullDev/Staff-Officer-Monika/blob/master/config/config.template.js) and paste it as `config/config.custom.js` OR use `npm run generate-config`. <br><br>
5. Configure it in your favourite editor by editing `config/config.custom.js`. <br><br>
6. Start it in development mode by running <br>
$ `npm start` <br>
or start in production mode <br>
$ `npm run start:prod` <br>
or (recommended), use PM2 <br>
$ `pm2 start pm2.ecosystem.json` <br><br>

<hr>

## :nut_and_bolt: Configuration

Once the config has been copied like described in [Step 4](#wrench-setup), it can be changed to your needs:

| Config Key | Description | Data Type | Default value |
| ---------- | --------- | ------------------ | ------------ |
| discord: <br> `bot_token` | Auth Token of the Discord bot. Can be created [here](https://discordapp.com/developers/). | String | N/A |
| discord: <br> `bot_status` | The bot status displayed on Discord. | String | N/A |
| discord: <br> `bot_owner_ids` | OPTIONAL: Discord IDs of Bot owners | String-Array | [] |
| discord: <br> `total_shards` | Total shard count | number , "auto" , undefined | 1 |
| discord: <br> `shards_per_cluster` | Shards per cluster | number , undefined | 1 |

<hr>

<img height="auto" width="100%" src="/assets/banner-crop.jpg" />
