import { CommandPlugin } from "bot-base";
import getToiletWineStatus from "./get-toilet-wine-status";
import getFaqAnswers from "./get-faq-answers";

const COMMANDS = {
  getToiletWineStatus,
  getFaqAnswers,
};

export const PLUGIN: CommandPlugin = {
  COMMANDS,
};
