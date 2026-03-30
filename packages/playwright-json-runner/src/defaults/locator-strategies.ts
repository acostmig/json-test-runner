import { LocatorParams } from "../schemas/locators/locator-parameters";
import { LocatorStrategies, resolveLocator } from "../locator-resolver";

const locatorStrategies: LocatorStrategies = {
  selector: async (page, params: LocatorParams) =>
    page.locator((params as any).value),

  xpath: async (page, params: LocatorParams) =>
    page.locator((params as any).value),

  role: async (page, params: LocatorParams) => {
    const p = params as any;
    return page.getByRole(p.role, {
      name: p.name,
      exact: p.exact,
      checked: p.checked,
      disabled: p.disabled,
      expanded: p.expanded,
      includeHidden: p.includeHidden,
      level: p.level,
      pressed: p.pressed,
      selected: p.selected,
    });
  },

  text: async (page, params: LocatorParams) => {
    const p = params as any;
    return page.getByText(p.value, { exact: p.exact });
  },

  label: async (page, params: LocatorParams) => {
    const p = params as any;
    return page.getByLabel(p.value, { exact: p.exact });
  },

  placeholder: async (page, params: LocatorParams) => {
    const p = params as any;
    return page.getByPlaceholder(p.value, { exact: p.exact });
  },

  altText: async (page, params: LocatorParams) => {
    const p = params as any;
    return page.getByAltText(p.value, { exact: p.exact });
  },

  title: async (page, params: LocatorParams) => {
    const p = params as any;
    return page.getByTitle(p.value, { exact: p.exact });
  },

  testId: async (page, params: LocatorParams) =>
    page.getByTestId((params as any).value),

  nested: async (page, params: LocatorParams) => {
    const p = params as any;
    const parentLocator = await resolveLocator(locatorStrategies, page, p.parent);
    const childLocator = await resolveLocator(locatorStrategies, page, p.child);
    return parentLocator.locator(childLocator);
  },
};

export default locatorStrategies;
