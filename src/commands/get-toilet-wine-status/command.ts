import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { CustomCommand } from "bensbigolbeard-bot-utils";
import { TOILET_WINE_COLLECTION_COUNT } from "../../constants";
import { getClaimMessage } from "./utils.js";

/* Local Constants */

const COMMAND_NAME = "did_ricardo_drink_my_wine";
const COMMAND_DESCRIPTION =
  "Check whether Ricardo already drank your toilet wine in the Canteen";

const MULTIPLE_IDS_INPUT_NAME = "token_ids";
const MULTIPLE_IDS_INPUT_DESCRIPTION =
  "token ids of your Toilet Wine (format: 1,2,3)";

const ERROR_MSG_COLOR = 0x880808; // red
const ERROR_MESSAGE =
  "OUUUCH: Some celie shanked me before I could get to the celar. Maybe give it another go.";

/* Local Utils */
const parseIds = (tokenIdsString: string) =>
  tokenIdsString
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => typeof n === "number" && n < TOILET_WINE_COLLECTION_COUNT);

/* Assemble Commands */

const idStringListOption = (option: SlashCommandStringOption) =>
  option
    .setName(MULTIPLE_IDS_INPUT_NAME)
    .setDescription(MULTIPLE_IDS_INPUT_DESCRIPTION)
    .setRequired(true);

const getToiletWineStatusCommand = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION)
  .addStringOption(idStringListOption)
  .toJSON();

/* Command Handler */

const isToiletWineClaimed: CustomCommand["handler"] = async (interaction) => {
  const tokenIdsString =
    interaction.options.getString(MULTIPLE_IDS_INPUT_NAME) || null;
  await interaction.deferReply();

  try {
    if (typeof tokenIdsString !== "string") {
      throw new Error("no valid token id provided");
    }
    const tokenIds = parseIds(tokenIdsString);

    interaction.editReply({
      content: await getClaimMessage(tokenIds),
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
  command: getToiletWineStatusCommand,
  name: COMMAND_NAME,
  handler: isToiletWineClaimed,
};

export default command;
