import { RuleKeys, RuleType } from "../config";

const getterSetterRules : Record<RuleKeys, RuleType> = {
    "input.datepicker": ({ element }) => element.matches(".custom-datepicker"),
    "select": ({ xpathEval }) => xpathEval("//select"),
    "text": ({ xpathEval }) => xpathEval("//input | //textarea"),
}


export default getterSetterRules;