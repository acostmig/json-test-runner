import { GetterStrategyType, RuleKeys } from "../config";

//strategies used to get values in the UI (getter-setter-rules.ts determine which strategy will be used)

const getterStrategies: Record<RuleKeys, GetterStrategyType> = {
    "input.datepicker": async ({ locator }) => {
        return await locator.inputValue();
    },
    "select": async ({ locator }) => {
        const selectedOption = locator.locator('option:checked');
        return selectedOption ? await selectedOption.innerText() : '';
    },
    "text": async ({ locator }) => {
        return await locator.inputValue();
    }
}

export default getterStrategies;