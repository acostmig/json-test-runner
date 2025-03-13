import { NestedStrategyParams, RoleStrategyParams, SelectorStrategyParams, TestIdStrategyParams, TextStrategyParams } from "src/schemas/locators/locator-parameters";
import { LocatorStrategies, resolveLocator } from "../locator-resolver";

const locatorStrategies: LocatorStrategies = {
  selector: async (page, strategy: SelectorStrategyParams) => 
    page.locator(strategy.value),

  role: async (page, strategy: RoleStrategyParams) => 
    page.getByRole(strategy.value.role, strategy.value.options ?? {}),

  testId: async (page, strategy: TestIdStrategyParams) => 
    page.getByTestId(strategy.value),

  text: async (page, strategy: TextStrategyParams) => 
    page.getByText(strategy.value),

  nested: async (page, strategy: NestedStrategyParams) => {
    const parentLocator = await resolveLocator(locatorStrategies, page, strategy.parent);
    const childLocator = await resolveLocator(locatorStrategies, page, strategy.child);
    return parentLocator.locator(childLocator);
  },
};
export default locatorStrategies

