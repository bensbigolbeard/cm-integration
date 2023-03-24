import { SlashCommandBuilder } from "discord.js";
import { CustomCommand } from "bensbigolbeard-bot-utils";
import FAQs from "../../../faqs.json";
import {
  faqAutocomplete,
  getStringQuestionOption,
  QUESTION_INPUT_NAME,
} from "./utils";

/* Local Constants */

const COMMAND_NAME = "wtfaq";
const COMMAND_DESCRIPTION =
  "Got a question? For a pack of smokes, I'll tell ya whatever you need.";

const ERROR_MSG_COLOR = 0x880808; // red
const ERROR_MESSAGE =
  "Hmm, I don't know the answer to that. Maybe give it another go.";

/* Local Utils */

const getAnswer = (faqOption: string) =>
  FAQs.find(({ question }) => question === faqOption)?.answer;

/* Assemble Commands */

const getFaqEntryCommand = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION)
  .addStringOption(getStringQuestionOption())
  .toJSON();

/* Command Handler */

const getFaqEntry: CustomCommand["handler"] = async (interaction) => {
  const faqOption = interaction.options.getString(QUESTION_INPUT_NAME) || null;
  await interaction.deferReply();

  try {
    if (typeof faqOption !== "string") {
      throw new Error("no valid option provided");
    }

    const answer = getAnswer(faqOption);
    if (!answer) {
      throw new Error("no valid answer found");
    }

    interaction.editReply({
      content: `**${faqOption}**\n\n${answer}`,
    });
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
  command: getFaqEntryCommand,
  name: COMMAND_NAME,
  handler: getFaqEntry,
  autocomplete: faqAutocomplete,
};

export default command;
