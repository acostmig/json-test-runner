interface WithLabel {
  label?: string
}
interface WithDescription {
  description?: string
}
interface TestObject extends WithLabel, WithDescription {

}
export type ActionType = 'setfieldvalue' | 'click' | 'navigate' | 'expect' | 'assertFieldValueEquals' | 'assertFieldValueContains';


// Define test structure types
export interface TestAction extends TestObject {
  type: ActionType;
  selector?: string;
  identifier?: string;
  value?: string;
  url?: string;
  expectFunction?: string;
  nth: number
}

export interface TestStep extends TestObject {
  description: string;
  actions: TestAction[];
}

export interface TestScenario extends TestObject {
  name: string;
  steps: TestStep[];
}

export interface TestRun extends TestObject {
  browser: "chrome" | "firefox" | "webkit";
  host: string;
  scenarios: TestScenario[];
}

export { smartLocator } from "./smart-locator";
export { getLocatorValue, setLocatorValue } from "./locator-actions";
export { runTests } from './runner'

