import {
    ChatInputCommandInteraction,
    Message,
    EmbedBuilder,
    MessageReaction,
    TextChannel,
    User,
    SlashCommandBuilder,
    Colors,
} from "discord.js";

import { Bot, BotCommand } from "../structures";

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

const constructEmbedMessage = (message: string): { embeds: EmbedBuilder[] } => {
    const embed = new EmbedBuilder()
        .setDescription(message)
        .setColor(Colors.Orange);
    return { embeds: [embed] };
};

const collectMessage = async (
    user: User,
    channel: TextChannel,
    time = 120_000
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

const cancelQuiz = async (user: User, channel: TextChannel) => {
    const errEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("Quiz cancelled.")
        .setDescription("Quiz creation timed out.");
    await channel.send({ embeds: [errEmbed] });
};

const querySeconds = async (
    user: User,
    channel: TextChannel
): Promise<number | null> => {
    await channel.send(
        constructEmbedMessage("How many seconds for each question?")
    );
    const secondsMsg = await collectMessage(user, channel);
    if (!secondsMsg) {
        await cancelQuiz(user, channel);
        return null;
    }

    const questionTime = parseInt(secondsMsg.content, 10) * 1000;
    if (questionTime / 1000 <= 5) {
        const errEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription("Questions must be at least 5 seconds long.");
        await channel.send({ embeds: [errEmbed] });
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
    await channel.send(
        constructEmbedMessage(
            `Write option (${
                options.length + 1
            }) for question (${questionNumber})`
        )
    );

    const optionMessage = await collectMessage(user, channel);
    if (!optionMessage) {
        await cancelQuiz(user, channel);
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
    await channel.send(
        constructEmbedMessage(`Write question (${questions.length + 1}).`)
    );
    const questionMessage = await collectMessage(user, channel);
    if (!questionMessage) {
        await cancelQuiz(user, channel);
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

    await channel.send(
        constructEmbedMessage(
            `Write the correct option number for question (${
                questions.length + 1
            })`
        )
    );
    const correctOptionMsg = await collectMessage(user, channel);
    if (!correctOptionMsg) {
        await cancelQuiz(user, channel);
        return null;
    }

    const correctOptionIdx = Number(correctOptionMsg.content) - 1;
    if (correctOptionIdx > questionOptions.length - 1 || correctOptionIdx < 0) {
        const errEmbed = new EmbedBuilder()
            .setTitle("Quiz cancelled")
            .setDescription("That option does not exist.")
            .setColor(Colors.Red);
        await channel.send({ embeds: [errEmbed] });
        return null;
    }

    questions.push({
        question: questionMessage.content,
        options: questionOptions,
        correctOptionIdx,
    });
    return constructQuestions(user, channel, questions);
};

class Quiz extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("quiz")
                .setDescription("Create a quiz for server members to play..")
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Channel to host the quiz.")
                        .setRequired(true)
                )
                .toJSON(),
            { requiredPerms: ["Administrator"] }
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<"cached">,
        client: Bot
    ): Promise<void> {
        const quizChannel = interaction.options.getChannel(
            "channel"
        ) as TextChannel;

        const replyEmbed = new EmbedBuilder()
            .setColor(Colors.Orange)
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
            await cancelQuiz(
                interaction.user,
                interaction.channel as TextChannel
            );
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

        await quizChannel.send(
            constructEmbedMessage(
                `Quiz starting in <#${interaction.channel?.id}>`
            )
        );

        const quizEmbed = new EmbedBuilder()
            .setColor(Colors.Orange)
            .setTitle("Quiz")
            .setDescription(
                `Title: ${quizTitle}\nQuestions: ${questions.length}\nBy: <@${interaction.user.id}>`
            );

        await quizChannel.send({
            embeds: [quizEmbed],
        });

        const questionChoices: IQuestionChoice[][] = [];

        // NOTE(dylhack): this code will eventually all get replaced so linters
        // can be disabled here.
        // eslint-disable-next-line no-async-promise-executor
        await new Promise(async (resolve) => {
            let questionIdx = 0;
            const loopQuestion = async () => {
                const question = questions[(questionIdx += 1)];

                questionChoices.push([]);

                let questionMsgContent = `**${question.question}**\n\n`;

                question.options.forEach((option, idx) => {
                    questionMsgContent += `${numberEmojis[idx]}: ${option}\n`;
                });

                const questionMsg = await quizChannel.send(questionMsgContent);

                for (let i = 0; i < question.options.length; i += 1) {
                    questionMsg?.react(numberEmojis[i]);
                }

                const collector = questionMsg?.createReactionCollector({
                    filter: (reaction: MessageReaction, user: User) =>
                        Object.values(numberEmojis).indexOf(
                            reaction.emoji.name || ""
                        ) !== -1 &&
                        // user.id !== interaction.user.id &&
                        user.id !== client.user?.id,
                    time: questionTime,
                });

                await new Promise((res) => {
                    collector.on("collect", (reaction, user) => {
                        const choiceIdx = Object.values(numberEmojis).indexOf(
                            reaction.emoji.name || ""
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

            await loopQuestion();
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
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const user in userCorrectCount) {
            sortable.push([user, userCorrectCount[user]]);
        }

        sortable.sort((a, b) => a[1] - b[1]);
        const winnerId = sortable[sortable.length - 1][0];

        const finishEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle("Quiz Ended")
            .setDescription(
                `Congratulations <@${winnerId}>, you won the quiz!`
            );

        await quizChannel.send({ embeds: [finishEmbed] });
    }
}

export default new Quiz();
