import { cosmiconfig } from "cosmiconfig";
import { defaultConfig } from "./config-default";
import { Locator } from "playwright";
import { TestAction } from "./runner";

export type ActionType = 'setfieldvalue' | 'click' | 'navigate' | 'expect' | string;
export type RuleKeys = 'div.editable' | 'input.datepicker' | 'select' | 'input' | 'textarea' | string;

export type RuleType<TRuleKeys extends string> = TRuleKeys | ((linkedDomElement: Element) => boolean);
export type SetterStrategyType<TRuleKeys extends string> = TRuleKeys | ((locator: Locator, value: string | undefined) => Promise<void>);
export type GetterStrategyType<TRuleKeys extends string> = TRuleKeys | ((locator: Locator) => Promise<string | null>);
export type ActionTypeHandlers<TActionType extends string> = TActionType | ((locator: Locator, action: TestAction) => Promise<void>);

// Configuration interface
export interface Configuration<TActionType extends string = ActionType, TRuleKeys extends string = RuleKeys> {
  actionTypeHandlers: Record<TActionType, ActionTypeHandlers<TActionType>>; // Mapping of action types to action handler functions (materializes actions types on the JSON)
  identifierSelectors: string[]; // An array of xpaths used to identify elements
  rules: Record<TRuleKeys, RuleType<TRuleKeys>>; // Mapping of rule keys to RuleType functions
  setterStrategies: Record<TRuleKeys, SetterStrategyType<TRuleKeys>>; // Mapping of rule keys to setter functions
  getterStrategies: Record<TRuleKeys, GetterStrategyType<TRuleKeys>>; // Mapping of rule keys to getter functions
}


// Define the valid rule keys

let config: Configuration | undefined;
let loadingConfigPromise: Promise<Configuration> | undefined = undefined;

export async function getConfiguration(): Promise<Configuration> {
  if (config) {
    return config;
  }

  if (!loadingConfigPromise) {
    loadingConfigPromise = loadConfiguration()
      .then((loadedConfig) => {
        config = loadedConfig;
        loadingConfigPromise = undefined;
        return config;
      })
      .catch((error) => {
        loadingConfigPromise = undefined;
        throw error;
      });
  }

  return loadingConfigPromise;
}

export async function loadConfiguration(): Promise<Configuration> {
    const explorer = cosmiconfig('playwright-json', {
      searchPlaces: [
        'playwright-json.config.ts',
        'playwright-json.config.js',
      ]
    });
  
    try {
      const result = await explorer.search();
  
      if (result && result.config) {
        console.log(`✅ Loaded user config from: ${result.filepath}`);
        const userConfig: Partial<Configuration> = result.config.default || result.config;
  
        return {
          identifierSelectors: [...defaultConfig.identifierSelectors, ...(userConfig.identifierSelectors || [])],
          rules: { ...defaultConfig.rules, ...userConfig.rules },
          setterStrategies: { ...defaultConfig.setterStrategies, ...userConfig.setterStrategies },
          getterStrategies: { ...defaultConfig.getterStrategies, ...userConfig.getterStrategies },
          actionTypeHandlers: { ...defaultConfig.actionTypeHandlers, ...userConfig.actionTypeHandlers },
        };
      } else {
        console.warn('⚠️ No configuration file found. Using default config.');
        return defaultConfig;
      }
    } catch (error) {
      console.error('❌ Failed to load user config:', error);
      return defaultConfig;
    }
  }
  