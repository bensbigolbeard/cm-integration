import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { CustomCommand, CustomSlashCommand } from "bot-base";
import { TOILET_WINE_COLLECTION_COUNT } from "./../constants";
import { getToiletWineStatus } from "../utils/get-toilet-wine-status";

/* Local Constants */

const COMMAND_NAME = "did_ricardo_drink_my_wine";
const COMMAND_DESCRIPTION =
  "Check whether Ricardo already drank your toilet wine in the Canteen";

const MULTIPLE_IDS_INPUT_NAME = "token_ids";
const MULTIPLE_IDS_INPUT_DESCRIPTION =
  "token ids of your Toilet Wine (format: 1,2,3)";

const CLAIMED_MESSAGE_PREFIX = "Ricardo guzzled it all down already.";
const UNCLAIMED_MESSAGE_PREFIX =
  "Looks like you lucked out. Ricardo overlooked these bottles.";
const MIXED_RESULTS_MESSAGE_PREFIX =
  "Ricardo got his hands on some of your bottles, but couldn't drink it all.";

const CLAIMED_GROUP = "**CLAIMED**:";
const UNCLAIMED_GROUP = "**UNCLAIMED**:";

const ERROR_MSG_COLOR = 0x880808; // red
const ERROR_MESSAGE =
  "OUUUCH: Some celie shanked me before I could get to the celar. Maybe give it another go.";

/* Local Utils */

const parseIds = (tokenIdsString: string) =>
  tokenIdsString
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => typeof n === "number" && n < TOILET_WINE_COLLECTION_COUNT);

const formatIds = (ids: number[]) => ids.map((s) => `#${s}`).join(", ");

const formatMessagePrefix = (claimResults: (boolean | null)[]) => {
  const allClaimed = claimResults.every((isClaimed) => isClaimed === true);
  const allUnclaimed = claimResults.every((isClaimed) => isClaimed === false);
  const hasMixedResults = !allClaimed && !allUnclaimed;

  return hasMixedResults
    ? MIXED_RESULTS_MESSAGE_PREFIX
    : allClaimed
    ? CLAIMED_MESSAGE_PREFIX
    : UNCLAIMED_MESSAGE_PREFIX;
};

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

const isToiletWineClaimed: CustomSlashCommand["handler"] = async (
  interaction
) => {
  const tokenIdsString =
    interaction.options.getString(MULTIPLE_IDS_INPUT_NAME) || null;
  await interaction.deferReply();

  try {
    if (typeof tokenIdsString !== "string") {
      throw new Error("no valid token id provided");
    }
    const tokenIds = parseIds(tokenIdsString);

    interaction.editReply({
      content: await handleMultipleIds(tokenIds),
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

const handleMultipleIds = async (tokenIds: number[]) => {
  let claimResults = [];
  for (let i = 0; i < tokenIds.length; i++) {
    const isClaimed = await getToiletWineStatus(String(tokenIds[i]));
    claimResults.push(isClaimed);
  }

  const claimMessages = claimResults.reduce(
    (messages, isClaimed, i) => {
      if (typeof isClaimed !== "boolean") {
        console.error(
          new Error(`Encountered error while fetching claim status.`)
        );
        return messages;
      }
      const groupIdx = isClaimed ? 1 : 0;
      messages[groupIdx].push(tokenIds[i]);

      return messages;
    },
    [[], []] as number[][]
  );

  const messagePrefix = formatMessagePrefix(claimResults);

  const unclaimedMessage = claimMessages[0].length
    ? UNCLAIMED_GROUP + formatIds(claimMessages[0])
    : "";
  const claimedMessage = claimMessages[1].length
    ? CLAIMED_GROUP + formatIds(claimMessages[1])
    : "";

  return [messagePrefix, unclaimedMessage, claimedMessage].join("\n");
};

/* Assembled Command */
const command: CustomCommand = {
  command: getToiletWineStatusCommand,
  name: COMMAND_NAME,
  handler: isToiletWineClaimed,
};

export default command;
