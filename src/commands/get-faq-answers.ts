import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import {
  CustomCommand,
  CustomSlashCommand,
  CustomSlashCommandWithAutocomplete,
} from "bot-utils";
import { FAQs, CATEGORIES } from "../../faq-questions";

/* Local Constants */

const COMMAND_NAME = "wtfaq";
const COMMAND_DESCRIPTION =
  "Got a question? For a pack of smokes, I'll tell ya whatever you need.";

const FAQ_INPUT_NAME = "question";
const FAQ_INPUT_DESCRIPTION = "Select your question.";

const ERROR_MSG_COLOR = 0x880808; // red
const ERROR_MESSAGE =
  "Hmm, I don't know the answer to that. Maybe give it another go.";

/* Local Utils */

const getAnswer = (faqOption: string) =>
  FAQs.find(({ name }) => name === faqOption)?.value;

/* Assemble Commands */

const stringOption = (option: SlashCommandStringOption) =>
  option
    .setName(FAQ_INPUT_NAME)
    .setDescription(FAQ_INPUT_DESCRIPTION)
    .setAutocomplete(true)
    // .setChoices(
    //   ...FAQs.map(({ name }) => ({
    //     name,
    //     value: name,
    //   }))
    // )

    .setRequired(true);

const getFaqAnswerCommand = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION)
  .addStringOption(stringOption)
  .toJSON();

/* Command Handler */

const faqAutocomplete: CustomSlashCommandWithAutocomplete["autocomplete"] =
  async (interaction) => {
    if (!interaction.isAutocomplete()) {
      throw new Error("Invalid interaction type");
    }
    try {
      const focusedValue = interaction.options.getFocused();
      console.log("****focusedValue", focusedValue);

      const options = FAQs.map((q) => ({
        ...q,
        key: `${q.category}: ${q.name}`,
      }));
      const matches = options.filter(({ key }) =>
        key.toLowerCase().includes(focusedValue.toLowerCase())
      );
      await interaction.respond(
        matches.map(({ key, name }) => ({ name: key, value: name }))
      );
    } catch (e) {
      console.error(e);
      interaction.respond([{ name: "Error", value: (e as Error).toString() }]);
    }
  };

const getFaqAnswers: CustomSlashCommand["handler"] = async (interaction) => {
  const faqOption = interaction.options.getString(FAQ_INPUT_NAME) || null;
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
      content: `**${faqOption}**\n${answer}`,
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
  command: getFaqAnswerCommand,
  name: COMMAND_NAME,
  handler: getFaqAnswers,
  autocomplete: faqAutocomplete,
};

export default command;
