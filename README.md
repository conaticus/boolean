# Boolean

## About
A bot for the Conaticus' [Discord server](https://discord.com/invite/aDAsjZVzaH). A document of the development process has been made here: https://www.youtube.com/watch?v=xq2jR3_msmk. 

Also, remember to subscribe at https://www.youtube.com/channel/UCRLHJ-7b4pjDpBBHAUXEvjQ. 

## Documentation

### Setup

#### Installation

- Clone/Fork the repository
- Run `npm i`

#### Setting up the .env

In order to setup the bot, you must create a `.env` in the parent directory.
In this file you must declare the bot's `CLIENT_ID` and `TOKEN` - this is the client and token from the [Discord Developer Portal](https://discord.com/developers/applications).

Syntax:
```env
CLIENT_ID="your bot's Application ID AKA Client ID"
TOKEN="your bot's TOKEN"
```

This will automatically be ignored from the [.gitignore](https://github.com/conaticus/boolean/blob/master/.gitignore). So do not worry about this data being public.

#### 

#### Running the bot

In order to run the bot, you must run `npm run dev` to run the TypeScript developer environment. Don't worry about the other [package.json](https://github.com/conaticus/boolean/blob/master/package.json) scripts, they are for production.

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
