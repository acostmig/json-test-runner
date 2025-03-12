import { expect } from "@playwright/test";
import { extendConfig } from "playwright-json-runner/config";
import {getLocatorValue, setLocatorValue} from "playwright-json-runner"

const userConfig = extendConfig({
  locatorStrategies: {
    textWaitForDom: async (page, strategy) => 
    {
      page.waitForLoadState("domcontentloaded");
      return page.getByText(strategy.value)
    }
  },
  actionTypeHandlers:{ 
    "clear": async (locator)=>{
      setLocatorValue(locator, "")
    },
    "assertClear": async (locator)=>{
      expect(getLocatorValue(locator)).toBe("")
    }
  },
  //define when it applies
  rules: {
    "myCustomInput": ({ xpathEval }) => xpathEval("//div[@contenteditable=true")
  },
  //strategy for getting the value used when actionTypeHandlers call setLocatorValue
  getterStrategies: {
    "myCustomInput": async ({locator}) => await locator.inputValue()
  },
  //strategy for setting the value used when actionTypeHandlers call getLoctorvalue
  setterStrategies: {
    "myCustomInput": async ({locator, value}) => await locator.fill(value??"")
  }
  
});

export default userConfig;

