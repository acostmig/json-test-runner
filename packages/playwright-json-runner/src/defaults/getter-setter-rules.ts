import { RuleType } from "../config";

// Order matters — first match wins. Specific rules must come before generic ones.
const getterSetterRules: Record<string, RuleType> = {
  "input.datepicker": ({ element }) => element.matches(".custom-datepicker"),
  checkbox: ({ xpathEval }) => xpathEval("//input[@type='checkbox']"),
  radio: ({ xpathEval }) => xpathEval("//input[@type='radio']"),
  contenteditable: ({ element }) =>
    element.matches("[contenteditable='true'], [contenteditable='']") ||
    element.querySelector("[contenteditable='true'], [contenteditable='']") !== null,
  "select.bootstrap": ({ element }) =>
    element.querySelector(".dropdown-toggle, [data-bs-toggle='dropdown'], [data-toggle='dropdown']") !== null,
  select: ({ xpathEval }) => xpathEval("//select"),
  text: ({ xpathEval }) => xpathEval("//input | //textarea"),
};

export default getterSetterRules;
