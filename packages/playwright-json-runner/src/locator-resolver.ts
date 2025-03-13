import { Locator, Page } from "playwright";
import { LocatorStrategyParams, NestedStrategyParams, RoleStrategyParams, SelectorStrategyParams, TestIdStrategyParams, TextStrategyParams } from "./schemas/locators/locator-parameters";

export type LocatorStrategies =Partial< {
  selector: (page: Page, param: SelectorStrategyParams) => Promise<Locator>;
  role: (page: Page, param: RoleStrategyParams) => Promise<Locator>;
  testId: (page: Page, param: TestIdStrategyParams) => Promise<Locator>;
  text: (page: Page, param: TextStrategyParams) => Promise<Locator>;
  nested: (page: Page, param: NestedStrategyParams) => Promise<Locator>;
} & Record<string, (page: Page, param: any) => Promise<Locator>>>; 

export async function resolveLocator<T extends LocatorStrategyParams["type"]>(
    locatorStrategies: LocatorStrategies,
    page: Page, 
    strategy: Extract<LocatorStrategyParams, { type: T }>
  ): Promise<Locator> {
      // Get the correct handler
      const handler = locatorStrategies[strategy.type] as (
        page: Page, 
        param: Extract<LocatorStrategyParams, { type: T }>
      ) => Promise<Locator>;
  
      if (!handler) {
          throw new Error(`Invalid locator strategy: ${JSON.stringify(strategy)}`);
      }
  
      // Pass the correctly inferred type to the handler
      return handler(page, strategy);
}

