import { expect } from "@playwright/test";
import { Configuration, baseConfig } from "playwright-json-runner/config";
import {getLocatorValue, setLocatorValue} from "playwright-json-runner"


const userConfig: Configuration = {
  ...baseConfig,
  identifierSelectors:[
    ...baseConfig.identifierSelectors,
    //for example, in the application under test all checkboxes are defined by:
    //  having a label and a siblling right after that's an input type checkbox
   "//label[normalize-space(text())='{input}']/following-sibling::input[@type='checkbox']"
  ],
  actionTypeHandlers:{ 
    ...baseConfig.actionTypeHandlers,
    "clear": async (locator)=>{
      setLocatorValue(locator, "")
    },
    "assertClear": async (locator)=>{
      expect(getLocatorValue(locator)).toBe("")
    }
  },
  //define when it applies
  rules: {
    ...baseConfig.rules,
    "myCustomInput": ({ xpathEval }) => xpathEval("//div[@contenteditable=true")
  },
  //strategy for getting the value used when actionTypeHandlers call setLocatorValue
  getterStrategies: {
    ...baseConfig.getterStrategies,
    "myCustomInput": async ({locator}) => await locator.inputValue()
  },
  //strategy for setting the value used when actionTypeHandlers call getLoctorvalue
  setterStrategies: {
    ...baseConfig.setterStrategies,
    "myCustomInput": async ({locator, value}) => await locator.fill(value??"")
  }
  
};

export default userConfig;

