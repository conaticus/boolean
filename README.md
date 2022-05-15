# Boolean

## About

A bot for Conaticus' [Discord server](https://discord.com/invite/aDAsjZVzaH). A document of the development process has been made here: https://www.youtube.com/watch?v=xq2jR3_msmk.

## Documentation

### Setup

#### Installation

-   Clone/Fork the repository
-   Run `cd boolean`

#### Setting up the .env

In order to setup the bot, you must create a `.env` in the parent directory as you can see in the example, [.env.example](https://github.com/conaticus/boolean/blob/master/.env.example).

In this file you must declare the bot's `TOKEN` - this is the token from the [Discord Developer Portal](https://discord.com/developers/applications).

Syntax:

```env
TOKEN="your bot's TOKEN"
```

This will automatically be ignored from the [.gitignore](https://github.com/conaticus/boolean/blob/master/.gitignore). So don't worry about this data being public.

#### Docker

For Docker users, simply run

-   `docker-compose build`
-   `docker-compose up -d`

#### Running the bot

-   Run `npm i`

In order to start the bot, you must run `npm run dev` to run the TypeScript developer environment. Don't worry about the other `package.json` scripts, they are for production.

Due to many of the values being hardcoded, in order to run your instance you will need to change some values - such as the `guildId` in `config.ts` as it is used for deploying slash commands.

### Other Information

#### Embed Colours

General: `"#5E81AC"` \
Success: `"#A3BE8C"` \
Error: `"#BF616A"`

#### Configuration

The configuration file is used for constant variables that will be reused in the application, such as ids and reaction messages. It is located at [/src/config.ts](https://github.com/conaticus/boolean/blob/master/src/config.ts) - feel free to add anything that matches this description.

#### Data

Data is currently stored in the [data.json](https://github.com/conaticus/boolean/blob/master/data.json) file. Only reaction messages are stored here, which is why a database is not present. If you are adding more data handling to the bot, please switch to sqlite.

# Config

#### Set

To specify something in the config find the `config` object in the `config.ts` file, after specify something like `"NAME": <VALUE>`.

#### Get

To read from it, require `config` then read the value specified by doing `config.<VALUE TO READ>`.

# Logging

#### Console levels and their refrences

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

Look at [CONTRIBUTING.md](https://github.com/conaticus/boolean/blob/master/CONTRIBUTING.md) to find out how you can help contribute to the development of this bot.

## Support

If you like cool coding projects like this, subscribe to me at https://www.youtube.com/channel/UCRLHJ-7b4pjDpBBHAUXEvjQ
Help the community with a simple ⭐
