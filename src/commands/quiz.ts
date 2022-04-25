import { SlashCommandBuilder } from "@discordjs/builders";
import {
    Message,
    MessageEmbed,
    MessageReaction,
    TextChannel,
    User,
} from "discord.js";

import { IBotCommand } from "../types/types";

interface IQuestion {
    question: string;
    options: string[];
    correctOptionIdx: number;
}

interface IQuestionChoice {
    userId: string;
    correct: boolean;
}

const numberEmojis = [
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
    "🔟",
];

const constructEmbedMessage = (message: string): { embeds: MessageEmbed[] } => {
    const embed = new MessageEmbed().setDescription(message).setColor("ORANGE");
    return { embeds: [embed] };
};

const collectMessage = async (
    user: User,
    channel: TextChannel,
    time: number = 120_000
): Promise<Message | null> => {
    const collector = channel.createMessageCollector({
        filter: (msg: Message) => msg.author.id === user.id,
        max: 1,
        time,
    });

    return new Promise((resolve) => {
        collector.on("collect", (msg) => resolve(msg));
        collector.on("end", () => resolve(null));
    });
};

const cancelQuiz = (user: User, channel: TextChannel) => {
    const errEmbed = new MessageEmbed()
        .setColor("RED")
        .setTitle("Quiz cancelled.")
        .setDescription("Quiz creation timed out.");
    channel.send({ embeds: [errEmbed] });
};

const querySeconds = async (
    user: User,
    channel: TextChannel
): Promise<number | null> => {
    channel.send(constructEmbedMessage("How many seconds for each question?"));
    const secondsMsg = await collectMessage(user, channel);
    if (!secondsMsg) {
        cancelQuiz(user, channel);
        return null;
    }

    const questionTime = parseInt(secondsMsg.content) * 1000;
    if (questionTime / 1000 <= 5) {
        const errEmbed = new MessageEmbed()
            .setColor("RED")
            .setDescription("Questions must be at least 5 seconds long.");
        channel.send({ embeds: [errEmbed] });
        await querySeconds(user, channel);
    }

    return questionTime;
};

const constructQuestionOptions = async (
    user: User,
    channel: TextChannel,
    questionNumber: number,
    options: string[] = []
): Promise<string[] | null> => {
    channel.send(
        constructEmbedMessage(
            `Write option (${
                options.length + 1
            }) for question (${questionNumber})`
        )
    );

    const optionMessage = await collectMessage(user, channel);
    if (!optionMessage) {
        cancelQuiz(user, channel);
        return null;
    }

    if (optionMessage.content === "next") return options;

    options.push(optionMessage.content);
    return constructQuestionOptions(user, channel, questionNumber, options);
};

const constructQuestions = async (
    user: User,
    channel: TextChannel,
    questions: IQuestion[] = []
): Promise<IQuestion[] | null> => {
    channel.send(
        constructEmbedMessage(`Write question (${questions.length + 1}).`)
    );
    const questionMessage = await collectMessage(user, channel);
    if (!questionMessage) {
        cancelQuiz(user, channel);
        return null;
    }

    if (questionMessage.content === "finish") {
        return questions;
    }

    const questionOptions = await constructQuestionOptions(
        user,
        channel,
        questions.length + 1
    );
    if (!questionOptions) return null;

    channel.send(
        constructEmbedMessage(
            `Write the correct option number for question (${
                questions.length + 1
            })`
        )
    );
    const correctOptionMsg = await collectMessage(user, channel);
    if (!correctOptionMsg) {
        cancelQuiz(user, channel);
        return null;
    }

    const correctOptionIdx = Number(correctOptionMsg.content) - 1;
    if (correctOptionIdx > questionOptions.length - 1 || correctOptionIdx < 0) {
        const errEmbed = new MessageEmbed()
            .setTitle("Quiz cancelled")
            .setDescription("That option does not exist.")
            .setColor("RED");
        channel.send({ embeds: [errEmbed] });
        return null;
    }

    questions.push({
        question: questionMessage.content,
        options: questionOptions,
        correctOptionIdx,
    });
    return constructQuestions(user, channel, questions);
};

export const command: IBotCommand = {
    name: "Quiz",
    desc: "Create a quiz for server members to play..",
    data: new SlashCommandBuilder()
        .setName("quiz")
        .setDescription("Create a quiz for server members to play.")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("Channel to host the quiz.")
                .setRequired(true)
        ),
    requiredPerms: ["ADMINISTRATOR"],
    async execute(interaction, client) {
        const quizChannel = interaction.options.getChannel(
            "channel"
        ) as TextChannel;

        const replyEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setDescription("Setting up quiz..");
        await interaction.reply({ embeds: [replyEmbed], ephemeral: true });

        interaction.channel?.send(
            constructEmbedMessage("Please provide a quiz title.")
        );

        const titleMsg = await collectMessage(
            interaction.user,
            interaction.channel as TextChannel
        );
        if (!titleMsg) {
            cancelQuiz(interaction.user, interaction.channel as TextChannel);
            return;
        }

        const quizTitle = titleMsg.content;
        const questionTime = await querySeconds(
            interaction.user,
            interaction.channel as TextChannel
        );
        if (!questionTime) return;

        const questions = await constructQuestions(
            interaction.user,
            interaction.channel as TextChannel
        );
        if (!questions) return;

        quizChannel.send(
            constructEmbedMessage(
                `Quiz starting in <#${interaction.channel?.id}>`
            )
        );

        const quizEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle("Quiz")
            .setDescription(
                `Title: ${quizTitle}\nQuestions: ${questions.length}\nBy: <@${interaction.user.id}>`
            );

        await quizChannel.send({
            embeds: [quizEmbed],
        });

        const questionChoices: IQuestionChoice[][] = [];

        await new Promise(async (resolve) => {
            let questionIdx = 0;
            const loopQuestion = async () => {
                const question = questions[questionIdx++];

                questionChoices.push([]);

                let questionMsgContent = `**${question.question}**\n\n`;

                question.options.forEach((option, idx) => {
                    questionMsgContent += `${numberEmojis[idx]}: ${option}\n`;
                });

                const questionMsg = await quizChannel.send(questionMsgContent);

                for (let i = 0; i < question.options.length; i++) {
                    questionMsg?.react(numberEmojis[i]);
                }

                const collector = questionMsg?.createReactionCollector({
                    filter: (reaction: MessageReaction, user: User) =>
                        Object.values(numberEmojis).indexOf(
                            reaction.emoji.name!
                        ) !== -1 &&
                        // user.id !== interaction.user.id &&
                        user.id !== client.user?.id,
                    time: questionTime,
                });

                await new Promise((res) => {
                    collector.on("collect", (reaction, user) => {
                        const choiceIdx = Object.values(numberEmojis).indexOf(
                            reaction.emoji.name!
                        );
                        questionChoices[questionChoices.length - 1].push({
                            userId: user.id,
                            correct: choiceIdx === question.correctOptionIdx,
                        });
                    });

                    collector.on("end", () => {
                        res(undefined);
                    });
                });

                if (questionIdx === questions.length - 1) resolve(undefined);
                await loopQuestion();
            };

            loopQuestion();
        });

        const userCorrectCount: Record<string, number> = {};

        questionChoices.forEach((question) => {
            question.forEach((answer) => {
                if (answer.correct) {
                    if (userCorrectCount[answer.userId]) {
                        userCorrectCount[answer.userId] += 1;
                    } else {
                        userCorrectCount[answer.userId] = 1;
                    }
                }
            });
        });

        const sortable: [string, number][] = [];
        for (const user in userCorrectCount) {
            sortable.push([user, userCorrectCount[user]]);
        }

        sortable.sort((a, b) => a[1] - b[1]);
        const winnerId = sortable[sortable.length - 1][0];

        const finishEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Quiz Ended")
            .setDescription(
                `Congratulations <@${winnerId}>, you won the quiz!`
            );

        quizChannel.send({ embeds: [finishEmbed] });
    },
};
