import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import * as fs from "fs";



import { IBotCommand } from "../types/types";


const { Message, MessageEmbed } = require("discord.js");
const values: any = [];
const command: IBotCommand = {
    name: "Help Command",
    desc: "List of all commands",
    timeout: 2000,
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("lists all commands"),
    execute(interaction: CommandInteraction<"cached">) {
        fs.readdir("./dist/commands", (err, files) => {
            if (values[1] != null) {
                const embed = new MessageEmbed()
                    .setTitle(`Command List!`)
                    .setColor("2e3440")
                    .setTimestamp()
                    .setDescription(`List of all commands`);
                for (var i = 0; i < values.length; i++) {
                    embed.addField(values[i], values[(i = i + 1)], true);
                }
                return interaction.channel?.send({ embeds: [embed] });
            } else if (values[1] == null) {
                if (err) console.error(err);
                let jsfiles = files.filter((f) => f.split(".").pop() === "js");
                if (jsfiles.length <= 0) {
                    console.error(files);
                    return;
                }
                var namelist = "";
                var desclist = "";
                jsfiles.forEach((f, _i) => {
                    let props = require(`./${f}`);
                    namelist = props.command.name;
                    desclist = props.command.desc;
                    values.push(`${namelist}`);
                    values.push(`${desclist}`);
                });
                const embed = new MessageEmbed()
                    .setTitle(`Command List!`)
                    .setColor("5E81AC")
                    .setTimestamp()
                    .setDescription(`List of all commands`);
                for (var i = 0; i < values.length; i++) {
                    embed.addField(values[i], values[(i = i + 1)], true);
                }
                return interaction.channel?.send({ embeds: [embed] });
            }
        });
    },
};
export default command;