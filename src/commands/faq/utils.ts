import { pipe } from "froebel";
import { CustomCommand } from "bensbigolbeard-bot-utils";
import { CATEGORIES, FAQs } from "../../../faqs.js";
import { writeFile } from "node:fs/promises";
import { FAQ_FILE_PATH } from "../../constants";

export type FaqEntry = {
  question: string;
  answer: string;
  category: string;
};

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
