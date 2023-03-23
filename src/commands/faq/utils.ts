import { pipe } from "froebel";
import { CustomCommand } from "bensbigolbeard-bot-utils";
import { CATEGORIES, FAQs } from "../../../faqs.js";
import { writeFile } from "node:fs/promises";
import { FAQ_FILE_PATH } from "../../constants";
import { SlashCommandStringOption } from "discord.js";

export type FaqEntry = {
  question: string;
  answer: string;
  category: string;
};

export const QUESTION_INPUT_NAME = "question";
const QUESTION_INPUT_DESCRIPTION = "Enter your question.";
export const ANSWER_INPUT_NAME = "answer";
const ANSWER_INPUT_DESCRIPTION = "Enter your answer.";
export const CATEGORY_INPUT_NAME = "category";
const CATEGORY_INPUT_DESCRIPTION = "Select a category.";

/* Common commands */
export const stringQuestionOption = (option: SlashCommandStringOption) =>
  option
    .setName(QUESTION_INPUT_NAME)
    .setDescription(QUESTION_INPUT_DESCRIPTION)
    .setAutocomplete(true)
    .setRequired(true);

export const stringAnswerOption = (option: SlashCommandStringOption) =>
  option
    .setName(ANSWER_INPUT_NAME)
    .setDescription(ANSWER_INPUT_DESCRIPTION)
    .setRequired(true);

export const stringCategoryOption = (option: SlashCommandStringOption) =>
  option
    .setName(CATEGORY_INPUT_NAME)
    .setDescription(CATEGORY_INPUT_DESCRIPTION)
    .addChoices(...Object.keys(CATEGORIES).map((c) => ({ name: c, value: c })))
    .setRequired(true);

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
      key: `${q.category}: ${q.question}`,
    }));
    const matches = options.filter(({ key }) =>
      key.toLowerCase().includes(focusedValue.toLowerCase())
    );
    await interaction.respond(
      matches.map(({ key, question }) => ({ name: key, value: question }))
    );
  } catch (e) {
    console.error(e);
    interaction.respond([{ name: "Error", value: (e as Error).toString() }]);
  }
};

export const generateUpdatedFaqFile = async (faqs: FaqEntry[]) => {
  const faqsString = JSON.stringify(faqs, null, 2);
  const categoriesString = JSON.stringify(CATEGORIES, null, 2);
  return `
const CATEGORIES = ${categoriesString};
const FAQs = ${faqsString};
module.exports = { CATEGORIES, FAQs };
`;
};

export const writeFaqFile = pipe(generateUpdatedFaqFile, (file: string) =>
  writeFile(FAQ_FILE_PATH, file)
);
