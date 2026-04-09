import { SetterStrategyType } from "../config";

const setterStrategies: Record<string, SetterStrategyType> = {
  checkbox: async ({ locator, value }) => {
    const shouldBeChecked = value?.toLowerCase() === "true" || value === "1";
    await locator.setChecked(shouldBeChecked);
  },
  radio: async ({ locator, value }) => {
    // If locator is a container with multiple radios, find the one with matching value
    const isInput = await locator.evaluate((el) => el.tagName.toLowerCase() === "input");
    if (isInput) {
      await locator.check();
    } else {
      await locator.locator(`input[type="radio"][value="${value}"]`).check();
    }
  },
  contenteditable: async ({ locator, value }) => {
    await locator.click();
    await locator.evaluate((el) => (el.innerHTML = ""));
    await locator.pressSequentially(value ?? "");
  },
  "select.bootstrap": async ({ locator, value }) => {
    // Click the toggle to open the dropdown menu
    const toggle = locator.locator(
      ".dropdown-toggle, [data-bs-toggle='dropdown'], [data-toggle='dropdown']"
    );
    await toggle.click();
    // Click the matching option from the dropdown menu — try by value first, then by text
    const menu = locator.locator(".dropdown-menu");
    const byValue = menu.locator(`.dropdown-item[data-value="${value}"]`);
    if ((await byValue.count()) > 0) {
      await byValue.first().click();
    } else {
      await menu.locator(".dropdown-item", { hasText: value }).click();
    }
  },
  select: async ({ locator, value }) => {
    // Try matching by option value first, then fall back to label (visible text)
    const byValue = locator.locator(`option[value="${value}"]`);
    if ((await byValue.count()) > 0) {
      await locator.selectOption({ value });
    } else {
      await locator.selectOption({ label: value });
    }
  },
  text: async ({ locator, value }) => {
    await locator.fill(value ?? "");
  },
  "input.datepicker": async ({ locator, value }) => {
    await locator.click();
    await locator.page().locator(`//button[text()='${value}']`).click();
  },
};

export default setterStrategies;
