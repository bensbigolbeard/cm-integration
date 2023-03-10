import {
  COLLECTION_API_URL,
  CELMATES_COLLECTION_COUNT,
  CELMATES_OS_URL,
} from "./../constants";
import { pipe, batch, forward } from "froebel";
import {
  AttachmentBuilder,
  bold,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
} from "discord.js";
import { CustomCommand, fetchTokenMeta } from "bot-utils";

/* Local Constants */

const COMMAND_NAME = "swipe_mugshot";
const COMMAND_DESCRIPTION = "grab the mugshot of a particular hooligan";

const ID_INPUT_NAME = "token_id";
const ID_INPUT_DESCRIPTION = "token id of a celmate";
const MESSAGE_INPUT_NAME = "message";
const MESSAGE_INPUT_DESCRIPTION = "include a message with the image";
const SHOW_TRAITS_INPUT_NAME = "show_traits";
const SHOW_TRAITS_INPUT_DESCRIPTION =
  "prints out the traits from the token metadata";
const ERROR_MESSAGE =
  "Who the fuck is that?! Or wait... maybe I forgot who you asked about. Let's try that again...";

const ERROR_MSG_COLOR = 0x880808; // red
const EMBED_COLOR = 0x48dd00; // 1337 green

type ParsedResponse = Record<string, string> & {
  attributes: Record<string, string>[];
};

/* Local Utils */

const getFileName = (tokenId: number) => `celmate_${tokenId}.png`;
const getAssetUrl = (tokenId: number) => `${COLLECTION_API_URL}/${tokenId}`;

const batchBy = (num: number) => forward(batch, num);
function map<T, U>(fn: (x: T) => U): (list: T[]) => U[] {
  return (arr) => arr.map(fn);
}

const formatTraits = pipe(
  map(
    ({ trait_type, value }: Record<string, string>) =>
      `${bold(trait_type)}: ${value}`
  ),
  (arr: string[]) => arr.sort(),
  batchBy(2),
  map((pair) => (pair as string[][]).join(", ")), // need to resolve `batchBy` typing
  (arr: string[]) => arr.join("\n")
);

const getRandomTokenId = () =>
  Math.floor(Math.random() * CELMATES_COLLECTION_COUNT) || 1;

const fetchTokenImage = pipe(
  ({ image }: ParsedResponse) => image,
  fetch,
  (res: Response) => res.arrayBuffer(),
  (ab: ArrayBuffer) => Buffer.from(ab)
);

/* Command Interaction Handler */

const getById = async (interaction: ChatInputCommandInteraction) => {
  /* @ts-ignore: discord types for `member` missing `displayName` */
  const username = interaction.member?.displayName;
  const tokenId =
    interaction.options.getInteger(ID_INPUT_NAME) ?? getRandomTokenId();
  const message = interaction.options.getString(MESSAGE_INPUT_NAME);
  const showTraits = interaction.options.getBoolean(SHOW_TRAITS_INPUT_NAME);
  const url = getAssetUrl(tokenId);

  await interaction.deferReply();

  try {
    const meta: ParsedResponse = await fetchTokenMeta(url);
    const isRevealed = !!meta.attributes;
    console.log("****", meta);
    if (!isRevealed) {
      return interaction.editReply({
        content: `**Celmate #${tokenId}:** This Celmate is still on the run, which is a shame, 'cause it's kickass in here.`,
      });
    }

    const image = await fetchTokenImage(meta);
    const embed = new EmbedBuilder()
      .setTitle(meta.name)
      .setURL(`${CELMATES_OS_URL}/${tokenId}`)
      .setImage(`attachment://${getFileName(tokenId)}`)
      .setColor(EMBED_COLOR)
      .addFields(
        showTraits
          ? [{ name: bold("Traits:"), value: formatTraits(meta.attributes) }]
          : []
      );

    interaction.editReply({
      content: message ? `${bold(username)}: ${message}` : undefined,
      embeds: [embed],
      files: [new AttachmentBuilder(image, { name: getFileName(tokenId) })],
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

const idIntegerOption = (option: SlashCommandIntegerOption) =>
  option
    .setName(ID_INPUT_NAME)
    .setDescription(ID_INPUT_DESCRIPTION)
    .setMinValue(0)
    .setMaxValue(CELMATES_COLLECTION_COUNT - 1)
    .setRequired(true);

const messageStringOption = (option: SlashCommandStringOption) =>
  option.setName(MESSAGE_INPUT_NAME).setDescription(MESSAGE_INPUT_DESCRIPTION);

const includeInfoBooleanOption = (option: SlashCommandBooleanOption) =>
  option
    .setName(SHOW_TRAITS_INPUT_NAME)
    .setDescription(SHOW_TRAITS_INPUT_DESCRIPTION);

/** Sub Command */

const getByIdCommand = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION)
  .addIntegerOption(idIntegerOption)
  .addBooleanOption(includeInfoBooleanOption)
  .addStringOption(messageStringOption)
  .toJSON();

const command: CustomCommand = {
  name: COMMAND_NAME,
  command: getByIdCommand,
  handler: getById,
};

export default command;
