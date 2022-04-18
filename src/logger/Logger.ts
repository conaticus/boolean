



import { Embed } from "@discordjs/builders";
import {
    Channel,
    Collection,
    GuildMember,
    Message,
    MessageAttachment,
    MessageEmbed,
    TextChannel,
    User,
} from "discord.js";

const util = require('util');
const moment = require('moment');
const winston = require('winston');
/**
 * @class Logger
 */
export default class Logger {
    exitOnError: boolean;
    transports: any[];
    private _options: any;
    Wconsole: any;
	/**
	 * @prop {Array} transports
	 * @prop {Boolean} exitOnError
	 */
	constructor(options?: any) {
        
		this._options = options;

		this.transports = [
			new (winston.transports.Console)({
				colorize: true,
				level: options?.logLevel || 'info',
				debugStdout: true,
				timestamp: () => new Date(),
				formatter: this._formatter.bind(this),
			}),
		];

		this.exitOnError = false;


		this.Wconsole = new (winston.Logger)(this);
	}

    get console(): any {
        return this.Wconsole
    }

	/**
	 * Custom formatter for console
	 * @param {Object} options Formatter options
	 * @returns {String}
	 * @private
	 */
    //@ts-ignore
	_formatter(options) {
		let ts = util.format('[%s]', moment(options.timestamp()).format('HH:mm:ss')),
			level = winston.config.colorize(options.level);

		switch (options.level) {
			case 'debug':
				ts += ' ⚙ ';
				break;
			case 'info':
				ts += ' 🆗 ';
				break;
			case 'error':
				ts += ' 🔥 ';
				break;
			case 'warn':
				ts += ' ☣ ';
				break;
			case 'silly':
				ts += ' 💩 ';
				break;
		}

		let message = ts + ' ' + level + ': ' + (undefined !== options.message ? options.message : '') +
			(options.meta && Object.keys(options.meta).length ? '\n\t' + util.inspect(options.meta) : '');

		if (options.colorize === 'all') {
			return winston.config.colorize(options.level, message);
		}
		return message;
	}

    channel(embed: MessageEmbed, channel: Channel) {
        if (channel instanceof TextChannel) {
            channel.send({embeds: [embed]});
        }
    }
}

module.exports = Logger;