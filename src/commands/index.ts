import { CommandPlugin } from "bot-utils";
import getToiletWineStatus from "./get-toilet-wine-status";
import getFaqAnswers from "./get-faq-answers";
import getTokenById from "./get-token-by-id";

const COMMANDS = {
  getToiletWineStatus,
  getFaqAnswers,
  getTokenById,
};

export const PLUGIN: CommandPlugin = {
  COMMANDS,
};
