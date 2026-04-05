import { Locator, Page } from "playwright";
import { LocatorParams } from "./schemas/locators/locator-parameters";

export type LocatorStrategyFn = (page: Page, params: LocatorParams) => Promise<Locator>;
export type LocatorStrategies = Record<string, LocatorStrategyFn>;

export async function resolveLocator(
  strategies: LocatorStrategies,
  page: Page,
  params: LocatorParams
): Promise<Locator> {
  const handler = strategies[params.by];
  if (!handler) {
    throw new Error(`No locator strategy found for by="${params.by}". Register it in your config's locatorStrategies.`);
  }
  let locator = await handler(page, params);
  if (params.nth !== undefined) {
    locator = locator.nth(params.nth);
  }
  return locator;
}
