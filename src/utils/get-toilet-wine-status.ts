import { TOILET_WINE_CHECKER_URL, TOILET_WINE_CONTRACT } from "../constants";
import puppeteer from "puppeteer";

export const getToiletWineStatus = async (tokenId: string) => {
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
  await page.type("text/Token ID", tokenId);
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
