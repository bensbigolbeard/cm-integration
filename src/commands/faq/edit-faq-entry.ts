import { SlashCommandBuilder } from "discord.js";
import { CustomCommand } from "bensbigolbeard-bot-utils";
import { FAQs } from "../../../faqs.js";
import {
  ANSWER_INPUT_NAME,
  faqAutocomplete,
  QUESTION_INPUT_NAME,
  stringAnswerOption,
  stringQuestionOption,
  writeFaqFile,
} from "./utils";

/* Local Constants */

const COMMAND_NAME = "wtfaq_edit_question";
const COMMAND_DESCRIPTION =
  "Is one of these faqs a fucking liar? Tell me which one and I'll set it straight.";

const ERROR_MSG_COLOR = 0x880808; // red
const ERROR_MESSAGE =
  "Hmm, I don't know what you did, but you did it wrong. Maybe give it another go.";

/* Local Utils */

const getAnswerIndex = (faqOption: string) =>
  FAQs.findIndex(({ question }) => question === faqOption);

const editFaqAnswerCommand = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION)
  .addStringOption(stringQuestionOption)
  .addStringOption(stringAnswerOption)

  .toJSON();

/* Command Handler */

const editFaqEntries: CustomCommand["handler"] = async (interaction) => {
  const question = interaction.options.getString(QUESTION_INPUT_NAME);
  const answer = interaction.options.getString(ANSWER_INPUT_NAME);

  await interaction.deferReply();

  try {
    if (!question || !answer) {
      throw new Error("some inputs were invalid");
    }

    const currentEntryIdx = getAnswerIndex(question);
    const currentEntry = FAQs[currentEntryIdx];
    if (!currentEntry) {
      throw new Error("the question doesn't seem to exist");
    }

    const newFaq = [
      ...FAQs.slice(0, currentEntryIdx),
      { question: currentEntry.question, answer },
      ...FAQs.slice(currentEntryIdx + 1),
    ];
    await writeFaqFile(newFaq);

    await interaction.editReply({
      content: `I roughed'em up a bit. Next time he'll know better.\n\n**${question}**\n${answer}`,
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
  command: editFaqAnswerCommand,
  name: COMMAND_NAME,
  handler: editFaqEntries,
  autocomplete: faqAutocomplete,
};

export default command;
