import { Attachment, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { readFile, access, constants } from "node:fs/promises";
import { CustomCommand } from "bensbigolbeard-bot-utils";

import { STATS_FILE_PATH } from "../constants";

/* Local Constants */

const COMMAND_NAME = "read_most_wanted_poster";
const COMMAND_DESCRIPTION =
  "Wanna know who's still on the run? You better use this to do some bounty hunting!";

const EMBED_COLOR = 0x48dd00; // 1337 green
const ERROR_MSG_COLOR = 0x880808; // red
const ERROR_MESSAGE =
  "Hmm, I don't know the answer to that. Maybe give it another go.";

/* Local Utils */

const getImageFromFile = async (): Promise<Attachment | null> => {
  try {
    await access(STATS_FILE_PATH, constants.F_OK);
    const file = await readFile(STATS_FILE_PATH, { encoding: "utf8" });
    return JSON.parse(file);
  } catch (e) {
    console.log("no image retreived", e);
    return null;
  }
};

/* Assemble Commands */

const getFaqAnswerCommand = new SlashCommandBuilder()
  .setDefaultMemberPermissions(0)
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION)
  .toJSON();

/* Command Handler */

const getBurnChanceImage: CustomCommand["handler"] = async (interaction) => {
  await interaction.deferReply();
  const file = await getImageFromFile();
  const embed = new EmbedBuilder()
    .setImage(file?.url ?? null)
    .setColor(EMBED_COLOR);

  try {
    interaction.editReply({
      embeds: [embed],
    });
  } catch (e) {
    console.error(e);
    interaction.editReply({
      embeds: [
        {
          title: ERROR_MESSAGE,
          color: ERROR_MSG_COLOR,
        },
      ],
    });
  }
};

/* Assembled Command */
const command: CustomCommand = {
  command: getFaqAnswerCommand,
  name: COMMAND_NAME,
  handler: getBurnChanceImage,
};

export default command;
