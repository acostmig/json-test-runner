import { Locator } from "playwright";
import { expect } from "playwright/test";
import { Configuration } from "./config";
import { getFieldValue, setLocatorValue } from "./locator-actions";


export const defaultConfig: Configuration = {
  actionTypeHandlers: {
    "navigate": async (_, { url }) => {
      if (url) {
        console.log(`Navigating to ${url}`);
      }
      else
      {
        throw new Error("The 'navigate' action requires a 'url' property.");
      }
    },
    "setfieldvalue": async (locator, { value }) => {
      if (!locator) {
        throw new Error("The 'setFieldValue' action requires a 'locator' property.");
      }
      if (value === undefined || value === null) {
        throw new Error("The 'setFieldValue' action requires a non-null 'value' property.");
      }
      await setLocatorValue(locator, value);
    },
    "click": async (locator, { }) => {
      if (locator) {
        await locator.click();
      }
    },
    "assertFieldValueEquals": async (locator, { value }) => {
      if (!locator) {
        throw new Error("The 'setFieldValue' action requires a 'locator' property.");
      }
      if (value === undefined || value === null) {
        throw new Error("The 'setFieldValue' action requires a non-null 'value' property.");
      }
      const actual = await getFieldValue(locator, value);
      expect(actual).toBe(value);
    
    },
    "assertFieldValueContains": async (locator, { value }) => {
      if (!locator) {
        throw new Error("The 'setFieldValue' action requires a 'locator' property.");
      }
      if (value === undefined || value === null) {
        throw new Error("The 'setFieldValue' action requires a non-null 'value' property.");
      }
      const actual = await getFieldValue(locator, value);
      expect(actual).toContain(value);    
    },
    "expect": async (locator, { value, expectFunction }) => {
      if (!locator) {
        throw new Error("The 'expect' action requires a 'locator' property.");
      }
      
      if (!value) {
        throw new Error("The 'expect' action requires a non-null 'value' property.");
      }
      
      if (!expectFunction) {
        throw new Error("The 'expect' action requires an 'expectFunction' property.");
      }
      
      if (typeof (expect(locator) as any)[expectFunction] !== 'function') {
        throw new Error(`Invalid 'expectFunction': '${expectFunction}' is not a valid Playwright assertion.`);
      }
      await (expect(locator) as any)[expectFunction](value);

    }
  },

  //xpaths used to find locators
  identifierSelectors: [
    "//button[contains(@class, 'dropdown') and @id='{input}' and following-sibling::ul[.//button]]/..",
    "//button[@id='{input}']",
    "//*[@id='{input}']",
    "//label[text()='{input}']/preceding-sibling::input[@type='radio']",
    "//label[text()='{input}']/preceding-sibling::input[@type='checkbox']",
    "//button[normalize-space(text())='{input}']",
    "//button[.//*[normalize-space(text())='{input}']]",
    "//a[.//*[normalize-space(text())='{input}']]",
    "//a[normalize-space(text())='{input}']",
    "//button[@data-id='{input}']",
    "//*[@aria-label='{input}']",
    "//label[normalize-space(text())='{input}']/following-sibling::input",
    "//*[@name='{input}']",
    "//*[@title='{input}']",
  ],

  //rules used to find the strategy to be used against a given locator (element is the locator's outterHtml)
  rules: {
    // Editable divs
    "div.editable": (element) => element.tagName === "DIV" && element.hasAttribute("contenteditable"),
    // Datepicker input
    "input.datepicker": (element) => element.matches(".custom-datepicker"),
    // Keep defaults
    "select": (element) => element.tagName === "SELECT",
    "input": (element) => element.tagName === "INPUT",
    "textarea": (element) => element.tagName === "TEXTAREA",
  },

  //strategies used to set values in the UI (rules determine which strategy will be used)
  setterStrategies:{
    "select": async(locator,value) =>{
      await locator.selectOption({ label: value, value: value });
    },
    "input": async(locator,value) =>{
      await locator.fill(value??"");
    },
    "textarea": async(locator,value) =>{
      return defaultConfig.setterStrategies["input"](locator, value)
    },
    "div.editable": async(locator,value) =>{
      return defaultConfig.setterStrategies["input"](locator, value)
    },
    "input.datepicker": async (locator, value) => {
      await locator.click(); // Open the date picker
      await locator.page().locator(`//button[text()='${value}']`).click(); // Select the date
    },
    
  },
  getterStrategies: {
    "div.editable": async function (locator: Locator): Promise<string|null> {
      return await locator.evaluate((element) => element.textContent);
    },
    "input.datepicker": async function (locator: Locator): Promise<string> {
      return await locator.inputValue();
    },
    "select": async function (locator: Locator): Promise<string> {
      const selectedOption = await locator.locator('option:checked');
      return selectedOption ? await selectedOption.innerText() : '';
    },
    "input": async function (locator: Locator): Promise<string> {
      return await locator.inputValue();
    },
    "textarea": async function (locator: Locator): Promise<string> {
      return await locator.inputValue();
    }
  }
};




export { Configuration };

