import { SetterStrategyType, RuleKeys } from "../config";

//strategies used to set values in the UI (getter-setter-rules.ts determine which strategy will be used)


const setterStrategies: Record<RuleKeys, SetterStrategyType> = {
    "select": async ({ locator, ruleMatch, value }) => {
        await locator.selectOption({ label: value, value: value });
    },
    "text": async ({ locator,ruleMatch, value }) => {
        await locator.fill(value ?? "");
    },
    "input.datepicker": async ({ locator, value }) => {
        await locator.click(); // Open the date picker
        await locator.page().locator(`//button[text()='${value}']`).click(); // Select the date
    },

}
export default setterStrategies;