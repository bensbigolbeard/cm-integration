import path from "path";
import { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";

export const initRoutes = (app: FastifyInstance) => {
  app.get("/api/wtfaqs", async (req, res) => {
    const faqs = await readFile(path.join(__dirname, "../faqs.js"), "utf8");

    res.send(faqs);
  });
  return app;
};
