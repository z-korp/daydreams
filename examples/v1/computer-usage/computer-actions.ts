import { z } from "zod";
import { action } from "@daydreamsai/core";
import { ComputerTool } from "./base";
import type { ToolResult } from "./base";
import type { WorkingMemory } from "@daydreamsai/core";

// Initialize the ComputerTool instance
const computerTool = new ComputerTool();

// Get screen dimensions from the ComputerTool
const screenDimensions = {
  width: computerTool.toParams().display_width_px,
  height: computerTool.toParams().display_height_px,
};

/**
 * Helper function to store a screenshot in working memory
 * This avoids storing the base64 image data in the action result
 */
function storeScreenshotInMemory(
  ctx: any,
  base64Image?: string | null,
  mediaType?: string | null
) {
  if (base64Image && mediaType) {
    const dataUrl = `data:${mediaType};base64,${base64Image}`;
    (
      ctx.workingMemory as WorkingMemory & {
        currentImage?: URL;
        screenDimensions?: { width: number; height: number };
      }
    ).currentImage = new URL(dataUrl);
  }

  // Store screen dimensions in working memory
  (
    ctx.workingMemory as WorkingMemory & {
      screenDimensions?: { width: number; height: number };
    }
  ).screenDimensions = screenDimensions;
}

/**
 * Action to take a screenshot
 */
export const takeScreenshotAction = action({
  name: "takeScreenshot",
  description: "Capture a screenshot of the current screen",
  schema: z.object({}),
  async handler(call, ctx) {
    try {
      const result = await computerTool.execute({ action: "screenshot" });

      // Store the screenshot in working memory
      storeScreenshotInMemory(ctx, result.base64Image, result.mediaType);

      return {
        success: true,
        // Don't include the base64Image in the action result to avoid storing it in memory
        mediaType: result.mediaType,
        message: "Screenshot captured successfully",
        screenDimensions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        screenDimensions,
      };
    }
  },
});

/**
 * Action to move the mouse to specific coordinates
 */
export const moveMouseAction = action({
  name: "moveMouse",
  description: "Move the mouse cursor to specific coordinates on the screen",
  schema: z.object({
    x: z.number().describe("X coordinate to move the mouse to"),
    y: z.number().describe("Y coordinate to move the mouse to"),
  }),
  async handler(call, ctx) {
    try {
      const result = await computerTool.execute({
        action: "mouse_move",
        coordinate: [call.data.x, call.data.y],
      });

      // Store the screenshot in working memory
      storeScreenshotInMemory(ctx, result.base64Image, result.mediaType);

      return {
        success: true,
        message: `Mouse moved to coordinates (${call.data.x}, ${call.data.y})`,
        screenDimensions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        screenDimensions,
      };
    }
  },
});

/**
 * Action to perform a mouse click
 */
export const clickMouseAction = action({
  name: "clickMouse",
  description: "Perform a mouse click at the current cursor position",
  schema: z.object({
    button: z
      .enum(["left", "right", "middle"])
      .default("left")
      .describe("Mouse button to click (left, right, or middle)"),
    doubleClick: z
      .boolean()
      .default(false)
      .describe("Whether to perform a double-click"),
  }),
  async handler(call, ctx) {
    try {
      const action = call.data.doubleClick
        ? "double_click"
        : call.data.button === "left"
          ? "left_click"
          : call.data.button === "right"
            ? "right_click"
            : "middle_click";

      const result = await computerTool.execute({ action });

      // Store the screenshot in working memory
      storeScreenshotInMemory(ctx, result.base64Image, result.mediaType);

      return {
        success: true,
        message: `Performed ${call.data.doubleClick ? "double-" : ""}${call.data.button} click`,
        screenDimensions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        screenDimensions,
      };
    }
  },
});

/**
 * Action to type text
 */
export const typeTextAction = action({
  name: "typeText",
  description: "Type text at the current cursor position",
  schema: z.object({
    text: z.string().describe("Text to type"),
  }),
  async handler(call, ctx) {
    try {
      const result = await computerTool.execute({
        action: "type",
        text: call.data.text,
      });

      // Store the screenshot in working memory
      storeScreenshotInMemory(ctx, result.base64Image, result.mediaType);

      return {
        success: true,
        message: `Typed text: "${call.data.text}"`,
        screenDimensions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        screenDimensions,
      };
    }
  },
});

/**
 * Action to press a specific key
 */
export const pressKeyAction = action({
  name: "pressKey",
  description: "Press a specific key or key combination",
  schema: z.object({
    key: z.string().describe("Key to press (e.g., 'Return', 'Tab', 'a', etc.)"),
    modifiers: z
      .array(z.string())
      .optional()
      .describe(
        "Modifier keys to hold while pressing the key (e.g., ['shift', 'control'])"
      ),
  }),
  async handler(call, ctx) {
    try {
      const result = await computerTool.execute({
        action: "key",
        text: call.data.modifiers
          ? call.data.modifiers.join("+") + "+" + call.data.key
          : call.data.key,
      });

      // Store the screenshot in working memory
      storeScreenshotInMemory(ctx, result.base64Image, result.mediaType);

      const keyCombo = call.data.modifiers
        ? `${call.data.modifiers.join("+")}+${call.data.key}`
        : call.data.key;

      return {
        success: true,
        message: `Pressed key: ${keyCombo}`,
        screenDimensions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        screenDimensions,
      };
    }
  },
});

/**
 * Action to scroll the mouse wheel
 */
export const scrollMouseAction = action({
  name: "scrollMouse",
  description: "Scroll the mouse wheel",
  schema: z.object({
    direction: z
      .enum(["up", "down", "left", "right"])
      .default("down")
      .describe("Direction to scroll"),
    amount: z
      .number()
      .default(1)
      .describe("Amount to scroll (positive number)"),
  }),
  async handler(call, ctx) {
    try {
      const result = await computerTool.execute({
        action: "mouse_scroll",
        direction: call.data.direction,
        scrollAmount: call.data.amount,
      });

      // Store the screenshot in working memory
      storeScreenshotInMemory(ctx, result.base64Image, result.mediaType);

      return {
        success: true,
        message: `Scrolled ${call.data.direction} by ${call.data.amount}`,
        screenDimensions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        screenDimensions,
      };
    }
  },
});

/**
 * Action to drag the mouse
 */
export const dragMouseAction = action({
  name: "dragMouse",
  description:
    "Click and drag the mouse from current position to target coordinates",
  schema: z.object({
    x: z.number().describe("Target X coordinate to drag to"),
    y: z.number().describe("Target Y coordinate to drag to"),
  }),
  async handler(call, ctx) {
    try {
      const result = await computerTool.execute({
        action: "left_click_drag",
        coordinate: [call.data.x, call.data.y],
      });

      // Store the screenshot in working memory
      storeScreenshotInMemory(ctx, result.base64Image, result.mediaType);

      return {
        success: true,
        message: `Dragged mouse to coordinates (${call.data.x}, ${call.data.y})`,
        screenDimensions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        screenDimensions,
      };
    }
  },
});

/**
 * Action to get the current cursor position
 */
export const getCursorPositionAction = action({
  name: "getCursorPosition",
  description: "Get the current position of the mouse cursor",
  schema: z.object({}),
  async handler(call, ctx) {
    try {
      const result = await computerTool.execute({
        action: "cursor_position",
      });

      // Parse the output string (format: X=123,Y=456)
      const positionMatch = result.output?.match(/X=(\d+),Y=(\d+)/);

      if (positionMatch) {
        return {
          success: true,
          x: parseInt(positionMatch[1], 10),
          y: parseInt(positionMatch[2], 10),
          screenDimensions,
        };
      } else {
        return {
          success: false,
          error: "Failed to parse cursor position",
          screenDimensions,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        screenDimensions,
      };
    }
  },
});

/**
 * Action to focus a window by title
 */
export const focusWindowAction = action({
  name: "focusWindow",
  description: "Focus a window by its title",
  schema: z.object({
    windowTitle: z.string().describe("Title of the window to focus"),
  }),
  async handler(call, ctx) {
    try {
      const result = await computerTool.execute({
        action: "focus_window",
        windowTitle: call.data.windowTitle,
      });

      // Store the screenshot in working memory
      storeScreenshotInMemory(ctx, result.base64Image, result.mediaType);

      return {
        success: true,
        message: `Focused window: "${call.data.windowTitle}"`,
        screenDimensions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        screenDimensions,
      };
    }
  },
});

/**
 * Action to resize a window
 */
export const resizeWindowAction = action({
  name: "resizeWindow",
  description: "Resize a window by its title",
  schema: z.object({
    windowTitle: z.string().describe("Title of the window to resize"),
    width: z.number().describe("New width of the window"),
    height: z.number().describe("New height of the window"),
  }),
  async handler(call, ctx) {
    try {
      const result = await computerTool.execute({
        action: "resize_window",
        windowTitle: call.data.windowTitle,
        size: {
          width: call.data.width,
          height: call.data.height,
        },
      });

      // Store the screenshot in working memory
      storeScreenshotInMemory(ctx, result.base64Image, result.mediaType);

      return {
        success: true,
        message: `Resized window "${call.data.windowTitle}" to ${call.data.width}x${call.data.height}`,
        screenDimensions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        screenDimensions,
      };
    }
  },
});
