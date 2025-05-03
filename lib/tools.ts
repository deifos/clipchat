import { tool } from "ai";
import { z } from "zod";
import { aspectRatios } from "./aspect-ratios";

/**
 * Tool for setting the video aspect ratio
 * This will be called by the AI when it detects a request to change aspect ratio
 */
export const set_aspect_ratio = tool({
  description:
    "Set the aspect ratio of the video. Use this when the user wants to change the aspect ratio or mentions a platform that requires a specific aspect ratio.",
  parameters: z.object({
    ratio: z
      .enum(["16:9", "9:16", "1:1", "4:3", "21:9"])
      .describe("The aspect ratio to set"),
    platform: z
      .enum([
        "YouTube",
        "TikTok",
        "Instagram",
        "Instagram Reels",
        "Cinema",
        "TV",
        "General",
      ])
      .optional()
      .describe("The platform the video is being created for"),
    reason: z
      .string()
      .optional()
      .describe("Brief explanation of why this ratio was chosen"),
  }),
  execute: async ({ ratio, platform, reason }) => {
    console.log(
      "🎬 Setting aspect ratio to:",
      ratio,
      "Platform:",
      platform,
      "Reason:",
      reason
    );

    // Find the aspect ratio object that matches the requested ratio
    const aspectRatioObject = aspectRatios.find((r) => r.value === ratio);

    if (!aspectRatioObject) {
      throw new Error(`Invalid aspect ratio: ${ratio}`);
    }

    // Return the result that will be displayed to the user
    return {
      success: true,
      aspectRatio: aspectRatioObject,
      message: platform
        ? `Set aspect ratio to ${ratio} for ${platform}`
        : `Set aspect ratio to ${ratio}${reason ? `: ${reason}` : ""}`,
    };
  },
});

export const add_text_overlay = tool({
  description: "Add a text overlay to the video timeline",
  parameters: z.object({
    text: z.string().describe("The text to display on the video"),
    at: z
      .number()
      .default(0)
      .describe(
        "The second from the start of the video when the text should appear (0 = beginning of video)"
      ),
    duration: z
      .number()
      .default(5)
      .describe("How long the text stays on screen in seconds (default: 5)"),
    position: z
      .enum(["top", "center", "bottom"])
      .optional()
      .describe("Vertical position (default: center)"),
  }),
  execute: async ({ text, at, duration, position }) => {
    console.log("🎬 Adding text overlay:", { text, at, duration, position });

    // Generate a unique ID for this text overlay
    const id = `text_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    return {
      id,
      type: "text-overlay",
      text,
      at,
      duration,
      position: position || "center",
    };
  },
});

export const update_text_overlay = tool({
  description:
    "Update an existing text overlay in the video timeline. You can use preset styles like 'flashy', 'minimal', 'elegant', 'playful', or specify custom styles.",
  parameters: z.object({
    id: z
      .string()
      .optional()
      .describe("The ID of the text overlay to update (if known)"),
    text: z
      .string()
      .optional()
      .describe("New text to display (leave empty to keep existing)"),
    searchText: z
      .string()
      .optional()
      .describe("Text content to search for (if ID is not provided)"),
    at: z.number().optional().describe("New start time in seconds"),
    duration: z.number().optional().describe("New duration in seconds"),
    position: z
      .enum(["top", "center", "bottom"])
      .optional()
      .describe("New vertical position"),
    // Style presets
    preset: z
      .enum(["flashy", "minimal", "elegant", "playful"])
      .optional()
      .describe("Use a predefined style preset"),
    // Styling options
    color: z
      .string()
      .optional()
      .describe("Text color (e.g., 'white', '#FF0000', 'rgb(255,0,0)')"),
    backgroundColor: z
      .string()
      .optional()
      .describe(
        "Background color with optional opacity (e.g., 'rgba(0,0,0,0.5)')"
      ),
    fontSize: z.string().optional().describe("Font size (e.g., '48px', '2em')"),
    fontFamily: z
      .string()
      .optional()
      .describe("Font family (e.g., 'Arial', 'Helvetica')"),
    fontWeight: z
      .string()
      .optional()
      .describe("Font weight (e.g., 'normal', 'bold')"),
    textAlign: z
      .enum(["left", "center", "right"])
      .optional()
      .describe("Horizontal text alignment"),
    padding: z
      .string()
      .optional()
      .describe("Padding around the text (e.g., '10px', '10px 20px')"),
    borderRadius: z
      .string()
      .optional()
      .describe(
        "Border radius for the background (e.g., '5px', '10px', '999px' for pill shape)"
      ),
    shadow: z
      .string()
      .optional()
      .describe("Text shadow (e.g., '2px 2px 4px rgba(0,0,0,0.5)')"),
  }),
  execute: async ({
    id,
    text,
    searchText,
    at,
    duration,
    position,
    preset,
    color,
    backgroundColor,
    fontSize,
    fontFamily,
    fontWeight,
    textAlign,
    padding,
    borderRadius,
    shadow,
  }) => {
    console.log("🔄 Updating text overlay:", {
      id,
      text,
      searchText,
      at,
      duration,
      position,
      preset,
      color,
      backgroundColor,
      fontSize,
      fontFamily,
      fontWeight,
      textAlign,
      padding,
      borderRadius,
      shadow,
    });

    // Apply preset styles if specified
    let styleUpdates = {
      text,
      at,
      duration,
      position,
      color,
      backgroundColor,
      fontSize,
      fontFamily,
      fontWeight,
      textAlign,
      padding,
      borderRadius,
      shadow,
    };

    if (preset) {
      switch (preset) {
        case "flashy":
          styleUpdates = {
            ...styleUpdates,
            color: color || "#FF00FF", // Hot pink
            backgroundColor: backgroundColor || "rgba(0, 255, 255, 0.3)", // Cyan with transparency
            fontSize: fontSize || "64px",
            fontWeight: fontWeight || "bold",
            padding: padding || "15px 30px",
            borderRadius: borderRadius || "20px",
            shadow: shadow || "0 0 10px #FF00FF, 0 0 20px #00FFFF", // Neon glow effect
          };
          break;
        case "minimal":
          styleUpdates = {
            ...styleUpdates,
            color: color || "white",
            backgroundColor: backgroundColor || "rgba(0, 0, 0, 0.5)",
            fontSize: fontSize || "36px",
            fontWeight: fontWeight || "300",
            padding: padding || "10px 20px",
            borderRadius: borderRadius || "4px",
            shadow: shadow || "none",
          };
          break;
        case "elegant":
          styleUpdates = {
            ...styleUpdates,
            color: color || "#FFD700", // Gold
            backgroundColor: backgroundColor || "rgba(0, 0, 0, 0.7)",
            fontSize: fontSize || "48px",
            fontFamily: fontFamily || "Playfair Display, serif",
            fontWeight: fontWeight || "normal",
            padding: padding || "20px 40px",
            borderRadius: borderRadius || "8px",
            shadow: shadow || "2px 2px 4px rgba(0,0,0,0.3)",
          };
          break;
        case "playful":
          styleUpdates = {
            ...styleUpdates,
            color: color || "#FFB6C1", // Light pink
            backgroundColor: backgroundColor || "rgba(255, 255, 255, 0.9)",
            fontSize: fontSize || "52px",
            fontFamily: fontFamily || "Comic Sans MS, cursive",
            fontWeight: fontWeight || "bold",
            padding: padding || "15px 30px",
            borderRadius: borderRadius || "999px", // Pill shape
            shadow: shadow || "4px 4px 0px #FF69B4", // Offset shadow
          };
          break;
      }
    }

    return {
      id: id || "found_by_content",
      searchText,
      updates: styleUpdates,
    };
  },
});

export const find_text_overlay = tool({
  description: "Find a text overlay in the timeline by its content",
  parameters: z.object({
    text: z.string().describe("The text content to search for"),
  }),
  execute: async ({ text }) => {
    console.log("🔍 Finding text overlay with content:", text);

    // This is a placeholder - the actual implementation will be handled by the client
    return {
      found: true,
      id: "placeholder_id",
      text: text,
    };
  },
});

export const remove_text_overlay = tool({
  description: "Remove a text overlay from the video timeline",
  parameters: z.object({
    id: z
      .string()
      .optional()
      .describe("The ID of the text overlay to remove (if known)"),
    searchText: z
      .string()
      .optional()
      .describe("Text content to search for (if ID is not provided)"),
  }),
  execute: async ({ id, searchText }) => {
    console.log("🗑️ Removing text overlay:", { id, searchText });

    return {
      id: id || "found_by_content",
      searchText,
      action: "remove",
    };
  },
});

/**
 * Export all tools as a collection
 */
export const tools = {
  set_aspect_ratio,
  add_text_overlay,
  update_text_overlay,
  find_text_overlay,
  remove_text_overlay,
};
