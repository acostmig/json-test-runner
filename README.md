# playwright-json-runner

`playwright-json-runner` is a package that allows you to run [Playwright](https://playwright.dev/) tests using **JSON files** instead of traditional `.ts` or `.js` test files. This makes it easy to define and manage automated tests in a structured and configurable way.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Adding ActionTypes to the JSON](#configure-action)
    - default [action-typehandlers.ts](./packages//playwright-json-runner/src/defaults/action-type-handlers.ts)
  - [Adding Locator resolving strategies](#adding-locator-strategies)
      - default [identifier-selectors.ts](./packages//playwright-json-runner/src/defaults/locator-strategies.ts)
  - [Adding custom playwright interactions](#configure-custom-interactions)
      - default rule conditions (when each apply) [getter-setter-rules.ts](./packages//playwright-json-runner/src/defaults/getter-setter-rules.ts)
      - default getter strategies [getter-strategies.ts](./packages//playwright-json-runner/src/defaults/getter-strategies.ts)
      - default setter strategies [getter-strategies.ts](./packages//playwright-json-runner/src/defaults/setter-strategies.ts)

- [Writing a JSON Test](#writing-json-test)
  - Example JSON Test: [`json-tests/github.playwright.json`](./tests/playwright-json-runner-tests/json-tests/github.playwright.json)
- [Running JSON Tests](#running-json-tests)
- [Features](#features)
- [Troubleshooting](#troubleshooting)
- [Additional Examples](#additional-examples)
- [Generating json Schema](#json-schema)

---

## Installation

Install `playwright-json-runner` in your Playwright project:

```sh
npm install playwright-json-runner --save-dev
```

## Quick Start

1. Run
```npm install playwright-json-runner playwright @playwright/test --save-dev```
1. (optional) Create a config file named ```playwright-json.config.ts``` or ```playwright-json.config.js```.
1. Place your JSON test files ```json-tests``` directory [example](./tests/playwright-json-runner-tests/json-tests/github.playwright.json)
1. Create ```playwright.config.ts``` with the this test runner as a project
  ```ts
    import { defineConfig } from '@playwright/test';

    export default defineConfig({
      testDir: "tests", //traditional .spec.ts files live here

      //this enables json test runner to be discovered by playwright
      projects:[
        {
          name: "Json-runner",
          testDir: './node_modules/playwright-json-runner/dist/',
          testMatch: 'runner-playwright.js',
        }
      ]
    });
  ```

Run tests using ```npx playwright test``` or ```npx playwright test --ui``` Both JSON-defined tests and traditional .spec.ts or .spec.js files will be executed.



<a id="configuration"></a>
## Configuration 📄

playwright-json-runner looks for a configuration file named either ```playwright-json.config.ts``` or ```playwright-json.config.js```. 

By default:

- **Configuration file**: `playwright-json.config.ts`
- **(default) JSON test directory**: `json-tests`
- **(default) JSON test file format**: `*.playwright.json`

### Example `playwright-json.config.ts`
This file allows you to customize how json files are handled, where they live (directory and )

```ts
import { extendConfig } from "playwright-json-runner";

const userConfig = extendConfig({

  jsonTestDir: "json-tests"

});
export default userConfig;

```

# Configuring Playwright JSON Runner

## Table of Contents
- [Adding ActionTypes to the JSON](#configure-action)
- [Adding Custom Locator Resolving Strategies](#adding-locator-strategies)
- [Adding Custom Playwright Interactions](#configure-custom-interactions)

---

## Adding ActionTypes to the JSON <a id="configure-action"></a>

### What are ActionTypes?

Action types define the **possible interactions** available in JSON-based tests. These actions allow you to **extend Playwright functionality** to support custom behaviors.

### Why use custom ActionTypes?

- Allows handling new **custom interactions**.
- Enables **clearer test definitions** by making interactions explicit.
- **Enhances flexibility** by allowing you to define custom behaviors.

default [action-typehandlers.ts](./packages//playwright-json-runner/src/defaults/action-type-handlers.ts)

### Example Configuration

In your `playwright-json.config.ts` file, add a custom action type:

```ts
const userConfig = extendConfig({
   actionTypeHandlers: {
    "clear": async (locator) => {
      setLocatorValue(locator, "");
    },
    "assertClear": async (locator) => {
      expect(await getLocatorValue(locator)).toBe("");
    }
  }
});
export default userConfig
```

### Example JSON Test with Custom Action

```json
{
  "browser": "chromium",
  "host": "https://example.com",
  "scenarios": [
    {
      "name": "Test Custom Actions",
      "steps": [
        {
          "description": "Clear input field",
          "actions": [
            { "type": "clear", "selector": "input[id=username]" },
            { "type": "assertClear", "selector": "input[id=username]" }
          ]
        }
      ]
    }
  ]
}
```

---

## Adding Locator Strategies

### What are Locator Strategies?

Locator strategies **define how elements are located** in the UI when an `identifier` is used in JSON tests.

### Why use Locator Strategies?

- Provides **flexible and modular** ways to locate elements.
- Supports **multiple locator types** (e.g., selectors, roles, test IDs, text, and nested locators).
- Ensures **robust and scalable** test execution.


By default, several locator strategies are available, such as:

- **Selector-based locators** to find elements using CSS or XPath.
- **Role-based locators** for elements with specific ARIA roles.
- **Test ID locators** to find elements based on test-specific attributes.
- **Text-based locators** to find elements by visible text.
- **Nested locators** for more complex hierarchical selections.

default [identifier-selectors.ts](./packages//playwright-json-runner/src/defaults/locator-strategies.ts)

### Example Configuration

In `playwright-json.config.ts`, define or extend locator strategies:

```ts
const userConfig = extendConfig({
  locatorStrategies: {
    textWaitForDom: async (page, strategy) => {
      page.waitForLoadState("domcontentloaded");
      return page.getByText(strategy.value);
    }
  }
});
export default userConfig
```

### Example JSON Test Using Custom Selector

```json
{
  "description": "Find text element and click",
  "actions": [
    {
      "type": "click",
      "locator": {
        "type": "textWaitForDom",
        "value": "Accept Terms"
      }
    }
  ]
}
```

### Example HTML in the Application Under Test

```html
<label for="terms">Accept Terms</label>
<input type="checkbox" id="terms">
```

By defining custom locator strategies, tests become more **adaptive and resilient** to UI changes, ensuring a more stable automation framework.


## Adding Custom Playwright Interactions <a id="configure-custom-interactions"></a>

extends SetFieldValue & GetFieldValue actions and any action that uses them.
Custom interactions **override how element values are set or retrieved** they implement how we perform actions like **typing, clicking, or validating values**.

- Provides **better control** over how Playwright interacts with UI elements.
- Allows user to implement **how they handle** for non-standard elements.
- **Extends support** as needed for any UI Component

**IMPORTANT**: rules order matters! notice how the new rule (often most complex) is defined on top, because whatever rule matches first, is the one that will be used

  default rules and strategies already configured
  -[getter-setter-rules.ts](./packages//playwright-json-runner/src/defaults/getter-setter-rules.ts)
  -[getter-strategies.ts](./packages//playwright-json-runner/src/defaults/getter-strategies.ts)
  -[setter-strategies.ts](./packages//playwright-json-runner/src/defaults/setter-strategies.ts)

### Example: custom rules
`xpathEval` is a function that evaluates an XPath expression within a locator's context.
This allows users to dynamically resolve elements **relative to the resolved locator**, ensuring more flexible and adaptable test strategies.

#### **HTML Structure**
```html
<body>
  <div id="name">
    <customInputTag></customInputTag>
  </div>
</body>
```

#### **JSON Configuration (Example Action for `setFieldValue`)**
```json
{
  "selector": "[id='name']",
  "type": "setFieldValue",
  "value": "first name"
}
```

#### **📌 How `xpathEval` Works Here**
- The **locator** initially references the `div` (`id="name"`).
- `xpathEval("//customInputTag")` **runs inside the `div`'s context**, returning the `<customInputTag>` element.
- The `setFieldValue` action is **executed on `<customInputTag>`** instead of the `div` itself.



### Example: Custom Setter Strategy

```ts
const userConfig = extendConfig({
  rules: {
    "contentEditableDiv": ({ xpathEval }) => xpathEval("//div[@contenteditable=true]")
  },
  setterStrategies: {
    "myCustomInput": async ({ locator, value }) => {
      await locator.fill(value ?? "");
    }
  }
});
export default userConfig
```

### Example JSON Test Using Custom Interaction

```json
{
  "description": "Set value in an editable div",
  "actions": [
    {
      "type": "setFieldValue",
      "selector": "//div[@id='editor' and contenteditable=true]",
      "value": "Hello World"
    }
  ]
}
```

### Example: Custom Getter Strategy

```ts
const userConfig = extendConfig({
  rules: {
    "contentEditableDiv": ({ xpathEval }) => xpathEval("//div[@contenteditable=true]")
  },
  getterStrategies: {
    "contentEditableDiv": async ({ locator }) => {
      return await locator.inputValue();
    }
  }
});
export default userConfig
```

---

## Summary

- **Custom ActionTypes** extending JSON to handle new actions.
- **Custom Locator Strategies** expands the way we find elements(locators) in the UI 
- **Custom Playwright Interactions** expands how we interact with the elements (locators), good for handling special UI elements.

By configuring these aspects, you **enhance test reliability and flexibility**, making it easier to automate complex UI behaviors with JSON-based Playwright tests.


## 📌 Writing a JSON Test <a id="writing-json-test"></a>

To define a test, create a JSON file inside `json-tests/`. The default file name should follow the convention ```*.playwright.json``` :

sample path: 

```sh
projectName/json-tests/github.playwright.json
```

### Example [`json-tests/github.playwright.json`](./tests/playwright-json-runner-tests/json-tests/github.playwright.json)
```json
{
  "browser": "chromium",
  "host": "https://github.com",
  "scenarios": [
    {
      "name": "GitHub Login Test",
      "steps": [
        {
          "description": "Go to GitHub",
          "actions": [
            { "type": "navigate", "value": "https://github.com" }
          ]
        },
        {
          "description": "Click Sign In",
          "actions": [
            { "type": "click", "selector": "text=Sign in" }
          ]
        }
      ]
    }
  ]
}
```

## ▶ Running JSON Tests <a id="running-json-tests"></a>

Once the package is installed and tests are configured, run Playwright as usual:
```sh
npx playwright test
```
```sh
npx playwright test --ui
```

This will automatically pick up JSON-based tests and execute them alongside traditional `.spec.ts` files.

## 🎯 Features <a id="features"></a>

✅ Define tests in **pure JSON**  
✅ Works **seamlessly with Playwright**  
✅ Supports **navigation, clicks, inputs, expects pass through**  
✅ Configurable **all actions have strategies implemented are fully configurable**  
✅ Works **alongside TypeScript/JavaScript tests**  

## 🛠 Troubleshooting <a id="troubleshooting"></a>

- **No tests found?**  
  Ensure your JSON test directory (`json-tests/`) and test file (`.playwright.json`) are correctly named.

- **Custom configuration?**  
  Modify `playwright-json.config.ts` to point to the correct directory.

- **Playwright not detecting tests?**  
  Run with `DEBUG=pw:api` to see detailed logs.

---

## Additional Examples

The following example demonstrates how to extend your `playwright-json.config.ts` file with custom configuration options.

### Example: Extending the Configuration

In your `playwright-json.config.ts`, you can add custom action types, selectors, and strategies as follows:

```ts
import { expect } from "@playwright/test";
import { extendConfig } from "playwright-json-runner";
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
```

The above configuration enables the following functionalities in any JSON test:

- Use of `identifier: checkboxLabel` within any action (via `identifierSelectors`)
- A custom `clear` action (via `actionTypeHandlers`)
- A custom `assertClear` action (via `actionTypeHandlers`)
- Ability to use `setFieldValue` on an editable input using the `setterStrategies` entry `myCustomInput`
- Ability to use `assertFieldValue` on an editable input using the `getterStrategies` entry `myCustomInput`

implementations for all the [baseConfig](./packages/playwright-json-runner/src/defaults)


### Example JSON Test

```json
{
  "driver": "Playwright",
  "browser": "chrome",
  "host": "https://www.github.com/",
  "scenarios": [
    {
      "name": "Signup Test",
      "steps": [
        {
          "description": "Navigate to create account",
          "actions": [
            {
              "type": "clear",
              "selector": "[id=name]"
            },
            {
              "type": "assertClear",
              "selector": "[id=name]"
            },
            {
              "type": "click",
              "locator": 
              {
                "type": "textWaitForDom",
                "value": "checkbox label"
              }
            },
            {
              "type": "setFieldValue",
              "selector": "//div[@id='blog-body' and contenteditable=true]",
              "value": "some blog writing"
            },
            {
              "type": "assertFieldValueEquals",
              "selector": "//div[@id='blog-body' and contenteditables=true]",
              "value": "some blog writing"
            }
          ]
        }
      ]
    }
  ]
}
```

This configuration and test example showcase how you can **extend and customize** your Playwright JSON runner setup to handle a variety of UI interactions with enhanced flexibility.



### Example: Replacing the default Configuration

```ts
import { expect } from "@playwright/test";
import { Configuration, baseConfig } from "playwright-json-runner";
import { getLocatorValue, setLocatorValue } from "playwright-json-runner";

const userConfig: Configuration = {
  //...baseConfig allows you to use default, unless overwritten
  ...baseConfig,
  actionTypeHandlers: { 
    ...baseConfig.actionTypeHandlers,
    "clear": async (locator) => {
      setLocatorValue(locator, "");
    },
    "assertClear": async (locator) => {
      expect(await getLocatorValue(locator)).toBe("");
    }
  },

  //the below defines setfieldvalue and getfield value functionalities
  // be careful, if you use setFieldValue action in a
  // Define when it applies (important: the first rule to match will be used)
  rules: {
    "myCustomInput": ({ xpathEval }) => xpathEval("//div[@contenteditable=true]"),
  },
  // Strategy for setting the value used when actionTypeHandlers call getLocatorValue
  setterStrategies: {
    "myCustomInput": async ({ locator, value }) => await locator.fill(value ?? "")
  },
  // Strategy for getting the value used when actionTypeHandlers call setLocatorValue
  getterStrategies: {
    "myCustomInput": async ({ locator }) => await locator.inputValue()
  },
};

export default userConfig;
```

## Json Schema

this package is built using a Zod json schema, 
This schema helps you integreate with AI tools for generating a valid JSON to feed into this package

```sh
 npx playwright-json-runner dump-json-schema playwright-json-runner-schema.json 
```

you may also import the Zod schema object
```ts
import { testRunSchema } from "playwright-json-runner"
```


🚀 **Now you're ready to run Playwright tests using JSON!** 🚀🔥
