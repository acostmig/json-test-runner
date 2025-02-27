# playwright-json-runner

`playwright-json-runner` is a package that allows you to run [Playwright](https://playwright.dev/) tests using **JSON files** instead of traditional `.ts` or `.js` test files. This makes it easy to define and manage automated tests in a structured and configurable way.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Adding ActionTypes to the JSON](#configure-action)
    - default [action-typehandlers.ts](./packages//playwright-json-runner/src/defaults/action-type-handlers.ts)
  - [Adding custom selectors](#configure-custom-selectors)
      - default [identifier-selectors.ts](./packages//playwright-json-runner/src/defaults/identifier-selectors.ts)
  - [Adding custom playwright interactions](#configure-custom-interactions)
      - default rule conditions (when each apply) [getter-setter-rules.ts](./packages//playwright-json-runner/src/defaults/getter-setter-rules.ts)
      - default getter strategies [getter-strategies.ts](./packages//playwright-json-runner/src/defaults/getter-strategies.ts)
      - default setter strategies [getter-strategies.ts](./packages//playwright-json-runner/src/defaults/setter-strategies.ts)

- [Writing a JSON Test](#writing-a-json-test)
  - Example JSON Test: [`json-tests/github.playwright.json`](./tests/playwright-json-runner-tests/json-tests/github.playwright.json)
- [Running JSON Tests](#running-json-tests)
- [Features](#features)
- [Troubleshooting](#troubleshooting)
- [Additional Examples](#additional-examples)

---

## Installation

Install `playwright-json-runner` in your Playwright project:

```sh
npm install playwright-json-runner --save-dev
```

## Quick Start

  1. Install playwright playwright/test and playwright-json-runner.
  2. (optional) Create a config file named ```playwright-json.config.ts``` or ```playwright-json.config.js```.
  3. Place your JSON test files ```json-tests``` directory [example](#example-json-test)
  4. Run tests using npx playwright test. Both JSON-based tests and traditional .spec.ts or .spec.js files will be executed.

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
import { Configuration, baseConfig } from "playwright-json-runner/config";

const userConfig: Configuration = {
  ...baseConfig, //keeps default config
  //add other configs
};

```

# Configuring Playwright JSON Runner

## Table of Contents
- [Adding ActionTypes to the JSON](#configure-action)
- [Adding Custom Selectors](#configure-custom-selectors)
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
const userConfig: Configuration = {
  ...baseConfig,
  actionTypeHandlers: {
    ...baseConfig.actionTypeHandlers,
    "clear": async (locator) => {
      setLocatorValue(locator, "");
    },
    "assertClear": async (locator) => {
      expect(await getLocatorValue(locator)).toBe("");
    }
  }
};
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
            { "type": "clear", "identifier": "username" },
            { "type": "assertClear", "identifier": "username" }
          ]
        }
      ]
    }
  ]
}
```

---

## Adding Custom Selectors <a id="configure-custom-selectors"></a>

### What are Custom Selectors?

Custom selectors **define how elements are located** in the UI when an `identifier` is used in JSON tests.

### Why use Custom Selectors?

- Helps **match elements dynamically** based on multiple attributes.
- Allows defining **selectors that adapt to custom UI components**.
- Improves **robustness** of test execution.
**IMPORTANT**: order matters! notice how the xpath (often most complex) is defined on top, because whatever xpath matches first, is the one that will be used

default [identifier-selectors.ts](./packages//playwright-json-runner/src/defaults/identifier-selectors.ts)

### Example Configuration

In `playwright-json.config.ts`, define custom selector xpath:

```ts
const userConfig: Configuration = {
  ...baseConfig,
  identifierSelectors: [
    "//label[normalize-space(text())='{input}']/following-sibling::input[@type='checkbox']"
    ...baseConfig.identifierSelectors,
  ]
};
```

### Example JSON Test Using Custom Selector

```json
{
  "description": "Check Terms and Conditions",
  "actions": [
    { "type": "click", "identifier": "Accept Terms" }
  ]
}
```

### Example HTML in the Application Under Test

```html
<label for="terms">Accept Terms</label>
<input type="checkbox" id="terms">
```

---

## Adding Custom Playwright Interactions <a id="configure-custom-interactions"></a>

### What are Custom Interactions?

Custom interactions **override how elements are set or retrieved** when performing actions like **typing, clicking, or validating values**.

### Why use Custom Interactions?

- Provides **better control** over how Playwright interacts with UI elements.
- Allows user to implement **how they handle** for non-standard elements.
- **Extends support** as needed for any UI Component

**IMPORTANT**: rules order matters! notice how the new rule (often most complex) is defined on top, because whatever rule matches first, is the one that will be used

  - default (```baseConig```) rule conditions (when each apply) [getter-setter-rules.ts](./packages//playwright-json-runner/src/defaults/getter-setter-rules.ts)
  - default (```baseConig```) getter strategies [getter-strategies.ts](./packages//playwright-json-runner/src/defaults/getter-strategies.ts)
  - default (```baseConig```) setter strategies [getter-strategies.ts](./packages//playwright-json-runner/src/defaults/setter-strategies.ts)

### Example: Custom Setter Strategy

```ts
const userConfig: Configuration = {
  ...baseConfig,
  rules: {
    "myCustomInput": ({ xpathEval }) => xpathEval("//div[@contenteditable=true]")
    ...baseConfig.rules,
  },
  setterStrategies: {
    ...baseConfig.setterStrategies,
    "myCustomInput": async ({ locator, value }) => {
      await locator.fill(value ?? "");
    }
  }
};
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
const userConfig: Configuration = {
  ...baseConfig,
  rules: {
    "myCustomInput": ({ xpathEval }) => xpathEval("//div[@contenteditable=true]")
    ...baseConfig.rules,
  },
  getterStrategies: {
    ...baseConfig.getterStrategies,
    "myCustomInput": async ({ locator }) => {
      return await locator.inputValue();
    }
  }
};
```

---

## Summary

- **Custom ActionTypes** enable extending JSON tests with new actions.
- **Custom Selectors** improve UI element detection using dynamic XPath rules.
- **Custom Playwright Interactions** allow advanced handling of special UI elements.

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

## ▶ Running JSON Tests <a id="running-json-tests></a>

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
import { Configuration, baseConfig } from "playwright-json-runner/config";
import { getLocatorValue, setLocatorValue } from "playwright-json-runner";

const userConfig: Configuration = {
  ...baseConfig,
  identifierSelectors: [
    // For example, in the application under test, all checkboxes are defined by:
    // having a label and a sibling right after that's an input type checkbox.
    // (important: the first rule to match will be used)
    "//label[normalize-space(text())='{input}']/following-sibling::input[@type='checkbox']",
    ...baseConfig.identifierSelectors,
  ],
  actionTypeHandlers: { 
    ...baseConfig.actionTypeHandlers,
    "clear": async (locator) => {
      setLocatorValue(locator, "");
    },
    "assertClear": async (locator) => {
      expect(await getLocatorValue(locator)).toBe("");
    }
  },
  // Define when it applies (important: the first rule to match will be used)
  rules: {
    "myCustomInput": ({ xpathEval }) => xpathEval("//div[@contenteditable=true]"),
    ...baseConfig.rules,
  },
  // Strategy for setting the value used when actionTypeHandlers call getLocatorValue
  setterStrategies: {
    ...baseConfig.setterStrategies,
    "myCustomInput": async ({ locator, value }) => await locator.fill(value ?? "")
  },
  // Strategy for getting the value used when actionTypeHandlers call setLocatorValue
  getterStrategies: {
    ...baseConfig.getterStrategies,
    "myCustomInput": async ({ locator }) => await locator.inputValue()
  },
};

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
              "identifier": "name"
            },
            {
              "type": "assertClear",
              "identifier": "name"
            },
            {
              "type": "click",
              "identifier": "checkbox label"
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

🚀 **Now you're ready to run Playwright tests using JSON!** 🚀🔥
