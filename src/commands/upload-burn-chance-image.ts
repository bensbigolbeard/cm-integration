import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandAttachmentOption,
} from "discord.js";
import { CustomCommand } from "bot-utils";
import { writeFile } from "node:fs/promises";
import { STATS_FILE_PATH } from "../constants";

/* Local Constants */

const COMMAND_NAME = "hang_most_wanted_poster";
const COMMAND_DESCRIPTION =
  "Post the latest breakdown of the Steel Hose most wanted";

const IMAGE_UPLOAD_NAME = "upload";
const IMAGE_UPLOAD_DESCRIPTION = "upload an updated image ";
const ERROR_MESSAGE = "Who the fuck is that?! Let's try that again...";

const UPLOAD_MESSAGE = "File uploaded";

const ERROR_MSG_COLOR = 0x880808; // red
const EMBED_COLOR = 0x48dd00; // 1337 green

/* Local Utils */

/* Command Interaction Handler */

const getById = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply({ ephemeral: true });

  try {
    const file = interaction.options.getAttachment(IMAGE_UPLOAD_NAME);
    const embed = new EmbedBuilder()
      .setTitle(UPLOAD_MESSAGE)
      .setImage(file?.url ?? null)
      .setColor(EMBED_COLOR);

    if (file) {
      await writeFile(STATS_FILE_PATH, JSON.stringify(file.toJSON()));
    }

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

/* Command Options */

const imageAttachmentOption = (option: SlashCommandAttachmentOption) =>
  option
    .setName(IMAGE_UPLOAD_NAME)
    .setDescription(IMAGE_UPLOAD_DESCRIPTION)
    .setRequired(true);

/** Sub Command */

const getByIdCommand = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION)
  .addAttachmentOption(imageAttachmentOption)
  .toJSON();

const command: CustomCommand = {
  name: COMMAND_NAME,
  command: getByIdCommand,
  handler: getById,
};

export default command;
