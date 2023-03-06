import { CommandPlugin } from "bot-base";
import getToiletWineStatus from "./get-toilet-wine-status";

const COMMANDS = {
  getToiletWineStatus,
};

export const PLUGIN: CommandPlugin = {
  COMMANDS,
};
