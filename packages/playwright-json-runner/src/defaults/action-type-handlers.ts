import { expect } from "playwright/test";
import { ActionTypeHandler } from "../config";
import { setLocatorValue, getLocatorValue } from "../locator-actions";
import { ActionType } from "../";


const actionTypeHandlers : Record<ActionType, ActionTypeHandler> = {
    "sleep": async (_, {value})=>{

    },
    "navigate": async (_, { value }) => {
      if (value) {
        console.log(`Navigating to ${value}`);
        
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
    "click": async (locator) => {
      if (locator) {
        await locator.click();
      }
      else
      {
        throw new Error("The 'click' action requires a 'locator' or 'selector' property.");
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
    "assertElementExists": async (locator) => {
      await expect(locator).toBeAttached();   
    },
    "expect": async (locator, { value, playwrightFunction }) => {
      if (!locator) {
        throw new Error("The 'expect' action requires a 'locator' property.");
      }
      
      if (!value) {
        throw new Error("The 'expect' action requires a non-null 'value' property.");
      }
      
      if (!playwrightFunction) {
        throw new Error("The 'expect' action requires an 'playwrightFunction' property.");
      }
      
      if (typeof (expect(locator) as any)[playwrightFunction] !== 'function') {
        throw new Error(`Invalid 'playwrightFunction': '${playwrightFunction}' is not a valid Playwright assertion.`);
      }
      await (expect(locator) as any)[playwrightFunction](value);

    }
}

export default actionTypeHandlers;