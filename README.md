# Boolean

## About
A bot for Conaticus' [Discord server](https://discord.com/invite/aDAsjZVzaH). A document of the development process has been made here: https://www.youtube.com/watch?v=xq2jR3_msmk. 


If you like cool coding projects like this, subscribe to me at https://www.youtube.com/channel/UCRLHJ-7b4pjDpBBHAUXEvjQ

## Documentation

### Setup

#### Installation

- Clone/Fork the repository
- Run `cd boolean`
- Run `npm i`

#### Setting up the .env


In order to setup the bot, you must create a `.env` in the parent directory as you can see in the example, [.env.example](https://github.com/conaticus/boolean/blob/master/.env.example).

In this file you must declare the bot's `TOKEN` - this is the token from the [Discord Developer Portal](https://discord.com/developers/applications).

Syntax:
```env
TOKEN="your bot's TOKEN"
```


This will automatically be ignored from the [.gitignore](https://github.com/conaticus/boolean/blob/master/.gitignore). So don't worry about this data being public.

#### 

#### Running the bot

In order to start the bot, you must run `npm run dev` to run the TypeScript developer environment. Don't worry about the other `package.json` scripts, they are for production.

Due to many of the values being hardcoded, in order to run your instance you will need to change some values - such as the `guildId` in `config.ts` as it is used for deploying slash commands.

Due to many of the values being hardcoded, in order to run your instance you will need to change some values - such as the `guildId` in `config.ts` as it is used for deploying slash commands.

### Other Information

#### Embed Colours
General: `"ORANGE"` \
Success: `"GREEN"` \
Error: `"RED"`

#### Configuration

The configuration file is used for constant variables that will be reused in the application, such as ids and reaction messages. It is located at [/src/config.ts](https://github.com/conaticus/boolean/blob/master/src/config.ts) - feel free to add anything that matches this description.

#### Data

Data is currently stored in the [data.json](https://github.com/conaticus/boolean/blob/master/data.json) file. Only reaction messages are stored here, which is why a database is not present. If you are adding more data handling to the bot, please switch to sqlite.

## Contributing

Look at [CONTRIBUTING.md](https://github.com/conaticus/boolean/blob/master/CONTRIBUTING.md) to find out how you can help contribute to the development of this bot.
