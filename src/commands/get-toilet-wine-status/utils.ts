import puppeteer from "puppeteer";
import { access, constants, readFile, writeFile } from "node:fs/promises";
import { ifElse } from "bot-utils";
import {
  TOILET_WINE_CHECKER_URL,
  TOILET_WINE_CONTRACT,
  TOILET_WINE_STATUS_FILE_PATH,
} from "../../constants";
import { pipe, zip } from "froebel";

/* Local Constants */

const CLAIMED_MESSAGE_PREFIX = "Ricardo guzzled it all down already.";
const UNCLAIMED_MESSAGE_PREFIX =
  "Looks like you lucked out. Ricardo overlooked these bottles.";
const UNKNOWN_MESSAGE_PREFIX =
  "Some celie shanked me before I could check the celar entirely. Maybe check the ones I couldn't find again.";
const MIXED_RESULTS_MESSAGE_PREFIX =
  "Ricardo got his hands on some of your bottles, but couldn't drink it all.";

const CLAIMED_GROUP = "**CLAIMED**:";
const UNCLAIMED_GROUP = "**UNCLAIMED**:";
const UNKNOWN_GROUP = "**NOT FOUND**:";

/* Local Types */

type StoredClaimResults = Record<string, boolean | null>;
type ClaimResults = [number, boolean | null][];
type ClaimGroups = Record<"claimed" | "unclaimed" | "unknown", number[]>;

/* Utils */

const formatIds = (ids: number[]) => ids.map((s) => `#${s}`).join(", ");

const formatMessagePrefix = (results: ClaimResults) => {
  const allClaimed = results.every(([, isClaimed]) => isClaimed === true);
  const allUnclaimed = results.every(([, isClaimed]) => isClaimed === false);
  const hasUnknownResults = results.some(([, isClaimed]) => isClaimed === null);
  const hasMixedResults = !allClaimed && !allUnclaimed;
  const formatMessage = (msg: string) =>
    hasUnknownResults ? `${msg} ${UNKNOWN_MESSAGE_PREFIX}` : "";

  return formatMessage(
    hasMixedResults
      ? MIXED_RESULTS_MESSAGE_PREFIX
      : allClaimed
      ? CLAIMED_MESSAGE_PREFIX
      : UNCLAIMED_MESSAGE_PREFIX
  );
};

const getResultGroups = (results: ClaimResults) => {
  const groups: ClaimGroups = { unclaimed: [], claimed: [], unknown: [] };
  return results.reduce((messages, [id, isClaimed]) => {
    if (typeof isClaimed !== "boolean") {
      console.error(
        new Error(`Encountered error while fetching claim status.`)
      );
    }
    const groupKey =
      typeof isClaimed !== "boolean"
        ? "unknown"
        : isClaimed
        ? "claimed"
        : "unclaimed";
    messages[groupKey].push(id);

    return messages;
  }, groups);
};

const getStoredResults = async (): Promise<StoredClaimResults> => {
  try {
    await access(TOILET_WINE_STATUS_FILE_PATH, constants.F_OK);
    const file = await readFile(TOILET_WINE_STATUS_FILE_PATH, {
      encoding: "utf8",
    });
    return JSON.parse(file);
  } catch (e) {
    console.log("no stored results retrieved", e);
    return {};
  }
};

const storeResults = async (
  storedResults: StoredClaimResults,
  tokenIds: number[],
  claimResults: boolean[]
) => {
  const updatedResults: StoredClaimResults = {};
  const updates = tokenIds.reduce(
    (prev, id, i) => ({
      ...prev,
      [id]: claimResults[i],
    }),
    updatedResults
  );

  await writeFile(
    TOILET_WINE_STATUS_FILE_PATH,
    JSON.stringify({ ...storedResults, ...updates })
  );
};

export const getToiletWineStatus = async (tokenId: number) => {
  const browser = await puppeteer.launch({
    // headless: false,
    slowMo: 50,
  });
  const page = await browser.newPage();

  // ensure page is loaded
  await page.goto(TOILET_WINE_CHECKER_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("pierce/select", { timeout: 5000 });

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // enter form values and submit
  await page.select("pierce/select", TOILET_WINE_CONTRACT);
  await page.select("pierce/select", TOILET_WINE_CONTRACT);
  await page.type("text/Token ID", String(tokenId));
  await page.keyboard.press("Enter");

  // allow time to event loop to flush
  await new Promise((r) => setTimeout(r, 300));

  // look for claim message
  const getClaimMessage = () =>
    page.waitForSelector("text/been claimed", {
      timeout: 3500,
    });

  try {
    const textSelector = await retryFunctionCall(getClaimMessage);

    if (!textSelector) {
      throw new Error("Claim check result message not found.");
    }

    const isClaimed = await textSelector.evaluate((el) =>
      el.textContent?.includes("has been claimed")
    );

    if (typeof isClaimed !== "boolean") {
      throw new Error(
        "Encountered error when trying to determine claim status."
      );
    }

    console.info("Is toilet wine drunk.", isClaimed);

    await browser.close();

    return isClaimed;
  } catch (e) {
    await browser.close();
    console.error("Encountered error while checking claim:", e);
    return null;
  }
};

async function retryFunctionCall<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T | null> {
  try {
    const result = await fn();
    return result;
  } catch (e) {
    if (retries > 0) {
      return await retryFunctionCall(fn, retries - 1);
    }
    return Promise.resolve(null);
  }
}

const getClaimResults = async (tokenIds: number[]): Promise<ClaimResults> => {
  const cache = await getStoredResults();

  const claimResults = await Promise.all(
    tokenIds.map(
      ifElse(
        (id) => !!cache[id],
        () => true,
        getToiletWineStatus
      )
    )
  );

  // store results asynchronously
  storeResults(cache, tokenIds, claimResults.map(Boolean));

  return zip(tokenIds, claimResults);
};

const formatClaimMessage = (results: ClaimResults) => {
  const claimGroups = getResultGroups(results);

  const messagePrefix = formatMessagePrefix(results);

  const unclaimedMessage = claimGroups.unclaimed.length
    ? UNCLAIMED_GROUP + formatIds(claimGroups.unclaimed)
    : "";
  const claimedMessage = claimGroups.claimed.length
    ? CLAIMED_GROUP + formatIds(claimGroups.claimed)
    : "";
  const unknownMessage = claimGroups.unknown.length
    ? UNKNOWN_GROUP + formatIds(claimGroups.unknown)
    : "";

  return [messagePrefix, unclaimedMessage, unknownMessage, claimedMessage].join(
    "\n"
  );
};

const getClaimMessage = pipe(getClaimResults, formatClaimMessage);

export { getClaimMessage };
