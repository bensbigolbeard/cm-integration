import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { CustomCommand } from "bensbigolbeard-bot-utils";
import { CATEGORIES, FAQs } from "../../../faqs.js";
import { writeFaqFile } from "./utils";

/* Local Constants */

const COMMAND_NAME = "wtfaq_add_question";
const COMMAND_DESCRIPTION =
  "Got a question to add? I'll add whatever you want. It could even be a lie. I don't give a fuck.";

const QUESTION_INPUT_NAME = "question";
const QUESTION_INPUT_DESCRIPTION = "Enter your question.";
const ANSWER_INPUT_NAME = "answer";
const ANSWER_INPUT_DESCRIPTION = "Enter your answer.";
const CATEGORY_INPUT_NAME = "category";
const CATEGORY_INPUT_DESCRIPTION = "Select a category.";

const ERROR_MSG_COLOR = 0x880808; // red
const ERROR_MESSAGE =
  "Hmm, I don't know what you did, but you did it wrong. Maybe give it another go.";

/* Local Utils */

const stringQuestionOption = (option: SlashCommandStringOption) =>
  option
    .setName(QUESTION_INPUT_NAME)
    .setDescription(QUESTION_INPUT_DESCRIPTION)
    .setRequired(true);

const stringAnswerOption = (option: SlashCommandStringOption) =>
  option
    .setName(ANSWER_INPUT_NAME)
    .setDescription(ANSWER_INPUT_DESCRIPTION)
    .setRequired(true);

const stringCategoryOption = (option: SlashCommandStringOption) =>
  option
    .setName(CATEGORY_INPUT_NAME)
    .setDescription(CATEGORY_INPUT_DESCRIPTION)
    .addChoices(...Object.keys(CATEGORIES).map((c) => ({ name: c, value: c })))
    .setRequired(true);

const getFaqAnswerCommand = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION)
  .addStringOption(stringQuestionOption)
  .addStringOption(stringAnswerOption)
  .addStringOption(stringCategoryOption)
  .toJSON();

/* Command Handler */

const addFaqEntries: CustomCommand["handler"] = async (interaction) => {
  const question = interaction.options.getString(QUESTION_INPUT_NAME);
  const answer = interaction.options.getString(ANSWER_INPUT_NAME);
  const category = interaction.options.getString(CATEGORY_INPUT_NAME);
  await interaction.deferReply();

  try {
    if (!question || !answer || !category) {
      throw new Error("some inputs were invalid");
    }
    const newFaq = FAQs.concat({ question, answer, category });
    await writeFaqFile(newFaq);

    await interaction.editReply({
      content: `**${category} - ${question}**\n${answer}`,
    });

    // trigger the bot to restart and read the new faq file
    process.exit(0);
  } catch (e) {
    console.error(e);
    interaction.editReply({
      embeds: [
        {
          title: ERROR_MESSAGE,
          color: ERROR_MSG_COLOR,
        },
      ],
    });
  }
};

/* Assembled Command */
const command: CustomCommand = {
  command: getFaqAnswerCommand,
  name: COMMAND_NAME,
  handler: addFaqEntries,
};

export default command;
