import { expect } from "playwright/test";
import { ActionTypeHandler } from "../config";
import { setLocatorValue, getLocatorValue } from "../locator-actions";
import { ActionType } from "../";


const actionTypeHandlers : Record<ActionType, ActionTypeHandler> = {
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
    "click": async (locator, { nth }) => {
      if (locator) {
        if(nth)
        {
          await locator.nth(nth).click();
        }
        else
        { 
          await locator.click();
        }
      }
    },
    "assertFieldValueEquals": async (locator, { value }) => {
      if (!locator) {
        throw new Error("The 'setFieldValue' action requires a 'locator' property.");
      }
      if (value === undefined || value === null) {
        throw new Error("The 'setFieldValue' action requires a non-null 'value' property.");
      }
      const actual = await getLocatorValue(locator);
      expect(actual).toBe(value);
    
    },
    "assertFieldValueContains": async (locator, { value }) => {
      if (!locator) {
        throw new Error("The 'setFieldValue' action requires a 'locator' property.");
      }
      if (value === undefined || value === null) {
        throw new Error("The 'setFieldValue' action requires a non-null 'value' property.");
      }
      const actual = await getLocatorValue(locator);
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
}

export default actionTypeHandlers;