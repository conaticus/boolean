import { Channel, MessageEmbed, TextChannel } from "discord.js";

const pino = require("pino");
/**
 * @class Logger
 */
export default class Logger {
    Wconsole: any;
    /**
     * @prop {Array} transports
     * @prop {Boolean} exitOnError
     */
    constructor(options?: any) {
        this.Wconsole = new pino({
            transport: { target: "pino-pretty" },
            ...options,
        });
    }

    get console(): any {
        return this.Wconsole;
    }

    channel(embed: MessageEmbed, channel: Channel) {
        if (channel instanceof TextChannel) {
            channel.send({ embeds: [embed] });
        }
    }
}

module.exports = Logger;
