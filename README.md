<p><img src="https://cdn.discordapp.com/avatars/983780349253386330/76763825aaefa8c2b2251829b675777b.webp?size=128" alt="Boolean"></p>
<h1>Boolean</h1>

## About
Connaticus is a Discord bot for the Conaticus' [Discord server](https://discord.com/invite/aDAsjZVzaH). Boolean contains a collection of commands for your server, like a mod mailing system, a custom role menu, etc. Want to see how Boolean was made? Watch the development process [here](https://www.youtube.com/watch?v=xq2jR3_msmk)

## Setup and configuration guide

### Requirements for hosting own use of Bot
```
- MySQL Server
- Node v16x or above
```

### Installation
If you have all the requirements for hosting the bot, please follow the next step carefully!

1. Clone this repository to your computer, or to your vps.
```
git clone https://github.com/conaticus/boolean.git
```

2. Copy the contents of the `.env.example` file to the `.env` file and fill in the values. (Make sure you have declared the bots token in the `.env` file!)
3. Create a new database with your MYSQL server, and make sure you have the correct credentials in the `.env` file.
4. Run the following command to install the dependencies:
```
npm install
```
5. Run the following command to start the bot:
```
npm run dev
```

### Installation with Docker
If you don't have a server, you can use Docker to host the bot. You can simply use the `docker-compose up` command to start the bot.

If you need to update the bot, you can use the `docker-compose down` command to stop the bot, and then use the `docker-compose up --build` command to start it again or make sure to pull down latest changes from git using `git pull origin master` or use the built-in script `scripts/update.sh`.

#### Note
Due to many of the values being hardcoded, in order to run your instance you will need to change some values - such as the `guildId` in `config.ts` as it is used for deploying slash commands.

## Other Information

### Embed Colours

General: `"#5E81AC"` \
Success: `"#A3BE8C"` \
Error: `"#BF616A"`

### Running the configuration command

Configuration can be performed via the `/config` command to set special roles
and channels that the bot identifies and utilizes.

## Logging

### Console levels and their references

-   Fatal : `logger.console.fatal("")`
-   Error : `logger.console.error("")`
-   Warn : `logger.console.warn("")`
-   Info : `logger.console.info("")`
-   Debug : `logger.console.debug("")`
-   Trace : `logger.console.trace("")`
-   Silent : `logger.console.silent("")`

#### Channel logging

-Embed : `logger.channel(<EMBED>, <CHANNEL>)`

## Contributing

Look at the [CONTRIBUTING GUIDE](https://github.com/conaticus/boolean/blob/master/CONTRIBUTING.md) to find out how you can help contribute to the development of this bot.

## Support
If you have any questions, please join the [Discord](https://discord.gg/aDAsjZVzaH) or open an issue here on GitHub.

## Youtube
If you like cool coding projects like this, subscribe to [Conaticus](https://www.youtube.com/channel/UCRLHJ-7b4pjDpBBHAUXEvjQ)
