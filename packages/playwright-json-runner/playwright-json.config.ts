import { Configuration } from "./src/config-default"; // Import the type

const userConfig: Partial<Configuration> = {
  actionTypeHandlers:{
    "click": async (locator, { }) => {
      if (locator) {
        console.log("playwright-json.config.ts click")
        await locator.click();
      }
    }
  },
};

export default userConfig;
