import { CommandPlugin } from "bot-utils";
import getToiletWineStatus from "./get-toilet-wine-status";
import getFaqAnswers from "./get-faq-answers";
import getTokenById from "./get-token-by-id";
import getBurnChanceImage from "./get-burn-chance-image";
import uploadBurnChanceImage from "./upload-burn-chance-image";

const COMMANDS = {
  getToiletWineStatus,
  getFaqAnswers,
  getTokenById,
  getBurnChanceImage,
  uploadBurnChanceImage,
};

export const PLUGIN: CommandPlugin = {
  COMMANDS,
};
