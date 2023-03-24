import { CustomCommand } from "bensbigolbeard-bot-utils";
import FAQs from "../../../faqs.json";
import { writeFile } from "node:fs/promises";
import { FAQ_FILE_PATH } from "../../constants";
import { SlashCommandStringOption } from "discord.js";

export type FaqEntry = {
  question: string;
  answer: string;
};

export const QUESTION_INPUT_NAME = "question";
const QUESTION_INPUT_DESCRIPTION = "Enter your question.";
export const ANSWER_INPUT_NAME = "answer";
const ANSWER_INPUT_DESCRIPTION = "Enter your answer.";

/* Common commands */

export const getStringQuestionOption =
  (disableAutocomplete = false) =>
  (option: SlashCommandStringOption) =>
    option
      .setName(QUESTION_INPUT_NAME)
      .setDescription(QUESTION_INPUT_DESCRIPTION)
      .setAutocomplete(!disableAutocomplete)
      .setRequired(true);

export const stringAnswerOption = (option: SlashCommandStringOption) =>
  option
    .setName(ANSWER_INPUT_NAME)
    .setDescription(ANSWER_INPUT_DESCRIPTION)
    .setRequired(true);

/* Common Utils */

export const faqAutocomplete: CustomCommand["autocomplete"] = async (
  interaction
) => {
  if (!interaction.isAutocomplete()) {
    throw new Error("Invalid interaction type");
  }
  try {
    const focusedValue = interaction.options.getFocused();
    console.log("****focusedValue", focusedValue);

    const options = FAQs.map((q) => ({
      ...q,
      key: `${q.question}`,
    }));
    const matches = options.filter(({ key }) =>
      key.toLowerCase().includes(focusedValue.toLowerCase())
    );
    await interaction.respond(
      matches.map(({ question }) => ({ name: question, value: question }))
    );
  } catch (e) {
    console.error(e);
    interaction.respond([{ name: "Error", value: (e as Error).toString() }]);
  }
};

export const writeFaqFile = (faqs: typeof FAQs) =>
  writeFile(FAQ_FILE_PATH, JSON.stringify(faqs, null, 2));

export const getEntryIndex = (faqOption: string) =>
  FAQs.findIndex(({ question }) => question === faqOption);
