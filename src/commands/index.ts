import getToiletWineStatus from "./get-toilet-wine-status";
import * as faq from "./faq";
import getTokenById from "./get-token-by-id";
import getBurnChanceImage from "./get-burn-chance-image";
import uploadBurnChanceImage from "./upload-burn-chance-image";

export const COMMANDS = {
  ...faq,
  getToiletWineStatus,
  getTokenById,
  getBurnChanceImage,
  uploadBurnChanceImage,
};
