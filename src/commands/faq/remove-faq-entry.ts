import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { CustomCommand } from "bensbigolbeard-bot-utils";
import { FAQs } from "../../../faqs";
import { faqAutocomplete, writeFaqFile } from "./utils";

/* Local Constants */

const COMMAND_NAME = "wtfaq_remove_question";
const COMMAND_DESCRIPTION =
  'I can "take care" of a "question" for you. No one will ever know.';

const FAQ_INPUT_NAME = "question";
const FAQ_INPUT_DESCRIPTION = "Select the question to shank.";

const ERROR_MSG_COLOR = 0x880808; // red
const ERROR_MESSAGE = "Hmm, that didn't work. Maybe give it another go.";

/* Local Utils */

const getAnswerIndex = (faqOption: string) =>
  FAQs.findIndex(({ question }) => question === faqOption);

/* Assemble Commands */

const stringOption = (option: SlashCommandStringOption) =>
  option
    .setName(FAQ_INPUT_NAME)
    .setDescription(FAQ_INPUT_DESCRIPTION)
    .setAutocomplete(true)
    .setRequired(true);

const getFaqAnswerCommand = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION)
  .addStringOption(stringOption)
  .toJSON();

/* Command Handler */

const removeFaqEntry: CustomCommand["handler"] = async (interaction) => {
  const faqOption = interaction.options.getString(FAQ_INPUT_NAME) || null;
  await interaction.deferReply();

  try {
    if (typeof faqOption !== "string") {
      throw new Error("no valid option provided");
    }

    const answerIdx = getAnswerIndex(faqOption);
    if (answerIdx === -1) {
      throw new Error("no valid answer found");
    }
    const answer = FAQs[answerIdx];

    const newFaq = FAQs.filter((_, i) => i !== answerIdx);
    await writeFaqFile(newFaq);

    await interaction.editReply({
      content: `I just shanked "${answer.question}"\n\nYou're welcome.`,
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
  handler: removeFaqEntry,
  autocomplete: faqAutocomplete,
};

export default command;
