import { GetterStrategyType } from "../config";

const getterStrategies: Record<string, GetterStrategyType> = {
  checkbox: async ({ locator }) => {
    const checked = await locator.isChecked();
    return String(checked);
  },
  radio: async ({ locator }) => {
    const isInput = await locator.evaluate((el) => el.tagName.toLowerCase() === "input");
    if (isInput) {
      return (await locator.isChecked()) ? await locator.inputValue() : null;
    }
    // Container with multiple radios — find the checked one
    const checked = locator.locator('input[type="radio"]:checked');
    const count = await checked.count();
    return count > 0 ? await checked.inputValue() : null;
  },
  contenteditable: async ({ locator }) => {
    return await locator.innerText();
  },
  "select.bootstrap": async ({ locator }) => {
    // Read the currently displayed text from the toggle button
    const toggle = locator.locator(
      ".dropdown-toggle, [data-bs-toggle='dropdown'], [data-toggle='dropdown']"
    );
    return await toggle.innerText();
  },
  select: async ({ locator }) => {
    const selectedOption = locator.locator("option:checked");
    return selectedOption ? await selectedOption.innerText() : "";
  },
  text: async ({ locator }) => {
    return await locator.inputValue();
  },
  "input.datepicker": async ({ locator }) => {
    return await locator.inputValue();
  },
};

export default getterStrategies;
