import { Locator, Page } from "playwright";
import { getConfiguration } from "./config";

const config = getConfiguration()

/**
 * Finds a locator using multiple XPath strategies.
 * @param page Playwright Page instance.
 * @param identifier Field name, button text, or ID.
 * @param waitSeconds Timeout in seconds (default: 30s).
 * @returns Promise resolving to the found Locator or throwing an error if not found.
 */
export async function smartLocator(page: Page, identifier: string, waitSeconds = 30): Promise<Locator> {
  await page.waitForLoadState("domcontentloaded");

  const controller = new AbortController();
  const timeoutMs = waitSeconds * 1000;

  const locatorPromises = (await config).identifierSelectors.map(async (xpath) => {
    const selector = `xpath=${xpath.replace("{input}", identifier)} /self::*[not(contains(@style,'display: none'))]`;
    const locator = page.locator(selector);

    try {
      const found = await tryFinding(locator, controller.signal, timeoutMs);
      if (found) {
        controller.abort();
        return { locator, success: true };
      }
    } catch {
      return { locator, success: false };
    }
    return { locator, success: false };
  });

  const results = await Promise.allSettled(locatorPromises);
  const successful = results.find((result) => result.status === "fulfilled" && result.value.success);

  if (successful && successful.status === "fulfilled") {
    return successful.value.locator;
  }

  throw new Error(`❌ Could not find UI element for: "${identifier}"`);
}

/**
 * Attempts to locate an element with retries.
 * @param locator Playwright Locator.
 * @param signal AbortSignal to stop other trials if one succeeds.
 * @param timeoutMs Maximum timeout in milliseconds.
 * @returns Boolean indicating if the locator was found.
 */
async function tryFinding(locator: Locator, signal: AbortSignal, timeoutMs: number): Promise<boolean> {
  const delayMs = 500;
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (signal.aborted) return false; // Stop if another XPath found it

    try {
      if (await locator.count() > 0) return true; // Found element, return immediately
    } catch {
      // Ignore errors and continue retrying
    }
    
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return false; // Timeout reached, element not found
}