import getToiletWineStatus from "./get-toilet-wine-status";
import { getFaqEntry, addFaqEntry, removeFaqEntry } from "./faq";
import getTokenById from "./get-token-by-id";
import getBurnChanceImage from "./get-burn-chance-image";
import uploadBurnChanceImage from "./upload-burn-chance-image";

export const COMMANDS = {
  getFaqEntry,
  addFaqEntry,
  removeFaqEntry,
  getToiletWineStatus,
  getTokenById,
  getBurnChanceImage,
  uploadBurnChanceImage,
};
