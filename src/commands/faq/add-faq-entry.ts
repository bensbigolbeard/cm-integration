import { SlashCommandBuilder } from "discord.js";
import { CustomCommand } from "bensbigolbeard-bot-utils";
import { FAQs } from "../../../faqs.js";
import {
  ANSWER_INPUT_NAME,
  QUESTION_INPUT_NAME,
  stringAnswerOption,
  stringQuestionOption,
  writeFaqFile,
} from "./utils";

/* Local Constants */

const COMMAND_NAME = "wtfaq_add_question";
const COMMAND_DESCRIPTION =
  "Got a question to add? I'll add whatever you want. It could even be a lie. I don't give a fuck.";

const ERROR_MSG_COLOR = 0x880808; // red
const ERROR_MESSAGE =
  "Hmm, I don't know what you did, but you did it wrong. Maybe give it another go.";

/* Local Utils */

const getAnswer = (faqOption: string) =>
  FAQs.find(({ question }) => question === faqOption);

const sanitizeValue = (value: string) => value.replace("<", "");

/* Assemble Commands */

const getFaqAnswerCommand = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION)
  .addStringOption(stringQuestionOption)
  .addStringOption(stringAnswerOption)
  .toJSON();

/* Command Handler */

const addFaqEntries: CustomCommand["handler"] = async (interaction) => {
  const question = interaction.options.getString(QUESTION_INPUT_NAME);
  const answer = interaction.options.getString(ANSWER_INPUT_NAME);
  await interaction.deferReply();

  try {
    if (!question || !answer) {
      throw new Error("some inputs were invalid");
    }
    if (getAnswer(question)) {
      console.log(new Error("That question already exists!"));

      return await interaction.editReply({
        content: `**Hey, wait a minute!** That question already exists!`,
      });
    }

    const newFaqEntry = {
      question: sanitizeValue(question),
      answer: sanitizeValue(answer),
    };
    const newFaq = FAQs.concat(newFaqEntry);
    await writeFaqFile(newFaq);

    await interaction.editReply({
      content: `**${newFaqEntry.question}**\n${newFaqEntry.answer}`,
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
