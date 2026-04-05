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
    // Click the matching option from the dropdown menu
    const menu = locator.locator(".dropdown-menu");
    await menu.locator(".dropdown-item", { hasText: value }).click();
  },
  select: async ({ locator, value }) => {
    await locator.selectOption({ label: value });
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
