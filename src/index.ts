import { CommandPlugin } from "bensbigolbeard-bot-utils";
import { COMMANDS } from "./commands";
import { initRoutes } from "./init-routes.js";

export const PLUGIN: CommandPlugin = {
  COMMANDS,
  initRoutes,
};
