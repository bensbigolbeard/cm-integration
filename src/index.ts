import { CommandPlugin } from "bensbigolbeard-bot-utils";
import { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";
import path from "path";
import { COMMANDS } from "./commands";

export const initRoutes = (app: FastifyInstance) => {
  app.get("/faqs", async (req, res) => {
    console.log("requesting faqs");
    const faqs = await readFile(path.join(__dirname, "../faqs.js"), "utf8");
    console.log("faqs", faqs);

    res.send(faqs);
  });
  return app;
};

export const PLUGIN: CommandPlugin = {
  COMMANDS,
  initRoutes,
};
