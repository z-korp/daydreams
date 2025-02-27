import { createDreams, LogLevel, validateEnv } from "@daydreamsai/core";
import { cli } from "@daydreamsai/core/extensions";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import {
  takeScreenshotAction,
  // Commenting out other actions that might depend on robotjs
  moveMouseAction,
  clickMouseAction,
  typeTextAction,
  pressKeyAction,
  scrollMouseAction,
  dragMouseAction,
  getCursorPositionAction,
  focusWindowAction,
  resizeWindowAction,
} from "./computer-actions";
import { executeBashAction } from "./bash-actions";
// Validate environment variables
validateEnv(
  z.object({
    ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  })
);

/**
 * Example demonstrating how to use computer actions to automate tasks
 */
async function main() {
  // Create a new Dreams instance with only the screenshot action
  const agent = await createDreams({
    logger: LogLevel.DEBUG,
    model: anthropic("claude-3-5-sonnet-latest"),
    extensions: [cli],
    actions: [
      takeScreenshotAction,
      // Commenting out other actions
      moveMouseAction,
      clickMouseAction,
      typeTextAction,
      pressKeyAction,
      scrollMouseAction,
      dragMouseAction,
      getCursorPositionAction,
      focusWindowAction,
      resizeWindowAction,
      executeBashAction,
    ],
  }).start();

  console.log("You can use the following actions:");
  console.log("- takeScreenshot: Capture a screenshot of the current screen");
  console.log(
    "  (Screenshots are automatically included in the AI's context for multimodal understanding)"
  );
  console.log("- moveMouse: Move the mouse cursor to specific coordinates");
  console.log(
    "- clickMouse: Perform a mouse click at the current cursor position"
  );
  console.log("- typeText: Type text at the current cursor position");
  console.log("- pressKey: Press a specific key or key combination");
  console.log("- scrollMouse: Scroll the mouse wheel");
  console.log(
    "- dragMouse: Click and drag the mouse from current position to target coordinates"
  );
  console.log(
    "- getCursorPosition: Get the current position of the mouse cursor"
  );
  console.log("- focusWindow: Focus a window by its title");
  console.log("- resizeWindow: Resize a window by its title");
  console.log("");
  console.log("Note: All computer actions automatically capture screenshots");
  console.log(
    "and include them in the AI's context for multimodal understanding."
  );

  // The CLI extension will handle user input and action execution
}

// Run the example
main().catch(console.error);
