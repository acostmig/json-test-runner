import { LocatorStrategies, NestedLocatorStrategy, resolveLocator, RoleLocatorStrategy, SelectorLocatorStrategy, TestIdLocatorStrategy, TextLocatorStrategy } from "../";

const locatorStrategies: LocatorStrategies = {
  selector: async (page, strategy: SelectorLocatorStrategy) => 
    page.locator(strategy.value),

  role: async (page, strategy: RoleLocatorStrategy) => 
    page.getByRole(strategy.value.role, strategy.value.options ?? {}),

  testId: async (page, strategy: TestIdLocatorStrategy) => 
    page.getByTestId(strategy.value),

  text: async (page, strategy: TextLocatorStrategy) => 
    page.getByText(strategy.value),

  nested: async (page, strategy: NestedLocatorStrategy) => {
    const parentLocator = await resolveLocator(locatorStrategies, page, strategy.parent);
    const childLocator = await resolveLocator(locatorStrategies, page, strategy.child);
    return parentLocator.locator(childLocator);
  },
};
export default locatorStrategies

