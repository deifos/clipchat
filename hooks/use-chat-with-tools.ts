"use client";

import { useAspectRatio } from "../context/aspect-ratio-context";
import { useTextOverlay } from "../context/text-overlay-context";
import { useState, useEffect, useCallback } from "react";
import { AspectRatioValue } from "../types";
import { aspectRatios } from "../lib/aspect-ratios";
import { Message } from "ai";
import { useChat } from "@ai-sdk/react";
import { TextOverlay } from "@/components/text-overlay-renderer";

/**
 * Helper function to find a text overlay using flexible search criteria
 * This will try multiple matching strategies to find the best match,
 * prioritizing recent overlays when multiple matches exist
 */
function findTextOverlayByContent(
  textOverlays: TextOverlay[],
  searchText: string
): TextOverlay | undefined {
  console.log("Searching for text overlay with content:", searchText);
  console.log("Available text overlays:", textOverlays);

  if (textOverlays.length === 0) {
    console.log("No text overlays available to search");
    return undefined;
  }

  // Sort overlays to prioritize the most recently added ones (assuming they're added in order)
  // This ensures we prefer to update newer overlays when multiple matches exist
  const sortedOverlays = [...textOverlays].reverse();

  // First, always try to return the most recently added overlay if we have one
  // This handles the common case where user adds text then immediately wants to modify it
  const mostRecent = sortedOverlays[0];
  console.log("Most recent overlay:", mostRecent.id, mostRecent.text);

  // If we only have one overlay or searchText is very vague (like 'the text'),
  // just return the most recent one
  if (textOverlays.length === 1 || searchText.length < 6) {
    console.log(`Returning most recent overlay by default: ${mostRecent.id}`);
    return mostRecent;
  }

  let matches: TextOverlay[] = [];

  // Helper function to normalize text for comparison
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"']/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const normalizedSearch = normalizeText(searchText);

  // Try exact matches first
  matches = sortedOverlays.filter(
    (overlay) => normalizeText(overlay.text) === normalizedSearch
  );

  if (matches.length > 0) {
    console.log(
      `Found ${matches.length} exact matches, using most recent: ${matches[0].id}`
    );
    return matches[0];
  }

  // Try contains matches
  matches = sortedOverlays.filter((overlay) => {
    const normalizedText = normalizeText(overlay.text);
    return (
      normalizedText.includes(normalizedSearch) ||
      normalizedSearch.includes(normalizedText)
    );
  });

  if (matches.length > 0) {
    console.log(
      `Found ${matches.length} partial matches, using most recent: ${matches[0].id}`
    );
    return matches[0];
  }

  // If all else fails, just return the most recent overlay
  console.log(`No matches found, defaulting to most recent: ${mostRecent.id}`);
  return mostRecent;
}

export function useChatWithTools() {
  const { setAspectRatio } = useAspectRatio();
  const {
    textOverlays,
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    findTextOverlay,
  } = useTextOverlay();
  const [lastToolCall, setLastToolCall] = useState<string | null>(null);

  // Track processed tool call IDs to avoid duplicate processing
  const [processedToolCallIds, setProcessedToolCallIds] = useState<Set<string>>(
    new Set()
  );

  // Debug logging for text overlays
  useEffect(() => {
    console.log("useChatWithTools - Current text overlays:", textOverlays);
  }, [textOverlays]);

  /**
   * Handle tool calls from the AI
   */
  const handleToolCall = useCallback(
    async (toolCall: any) => {
      console.log("🔧 Tool call received:", toolCall);

      // Handle aspect ratio tool calls
      if (toolCall.name === "set_aspect_ratio") {
        const { ratio, platform, reason } = toolCall.arguments;
        console.log(
          `🎬 Setting aspect ratio to ${ratio}${
            platform ? ` for ${platform}` : ""
          }`
        );

        // Find the aspect ratio object
        const aspectRatioObject = aspectRatios.find((r) => r.value === ratio);

        if (aspectRatioObject) {
          // Update the aspect ratio in the context
          setAspectRatio(aspectRatioObject);

          // Set the last tool call message
          const message = platform
            ? `Changed aspect ratio to ${ratio} for ${platform}`
            : `Changed aspect ratio to ${ratio}${reason ? `: ${reason}` : ""}`;

          setLastToolCall(message);

          // Return the result to the AI
          return {
            success: true,
            aspectRatio: aspectRatioObject,
            message,
          };
        } else {
          return { success: false, error: `Invalid aspect ratio: ${ratio}` };
        }
      }

      // Handle remove_text_overlay tool calls
      if (toolCall.name === "remove_text_overlay") {
        const { id, searchText } = toolCall.arguments;

        console.log(
          "🗑️ remove_text_overlay tool called with args:",
          toolCall.arguments
        );

        // Find the overlay to remove
        let targetId = id;
        let foundOverlay;

        // If no ID provided, try to find by searchText using our flexible search helper
        if (!targetId && searchText) {
          foundOverlay = findTextOverlayByContent(textOverlays, searchText);

          if (foundOverlay) {
            targetId = foundOverlay.id;
            console.log(
              `Found overlay with id ${targetId} matching search text "${searchText}"`
            );
          } else if (textOverlays.length > 0) {
            // If no match but we have overlays, just use the most recent one
            const sortedOverlays = [...textOverlays].reverse();
            foundOverlay = sortedOverlays[0];
            targetId = foundOverlay.id;
            console.log(
              `No exact match found, removing most recent overlay: ${targetId}`
            );
          } else {
            console.log("No text overlays available to remove");
          }
        }

        if (targetId) {
          // Remove the overlay from context
          console.log(`Removing overlay with ID: ${targetId}`);
          removeTextOverlay(targetId);

          setLastToolCall(`Removed text overlay`);

          return {
            success: true,
            id: targetId,
            message: `Text overlay removed successfully`,
          };
        } else {
          console.error("Could not find any text overlay to remove");
          return {
            success: false,
            error: `Could not find text overlay to remove`,
          };
        }
      }

      // Handle add_text_overlay tool calls
      if (toolCall.name === "add_text_overlay") {
        const {
          text,
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
        } = toolCall.arguments;

        console.log(
          "🔧 add_text_overlay tool called with args:",
          toolCall.arguments
        );

        // Generate a truly unique ID for this text overlay that includes microseconds
        const now = new Date();
        const timestamp = now.getTime(); // Standard timestamp in milliseconds
        const microTime = performance.now().toString().replace(".", ""); // Add microsecond precision
        const random = Math.random().toString(36).substring(2, 9);
        const id = `text_${timestamp}_${microTime}_${random}`;

        // Create the new text overlay with base properties
        const newOverlay: TextOverlay = {
          id,
          text,
          at,
          duration,
          position: position || "center",
        };

        // Add preset if specified
        if (preset) {
          newOverlay.preset = preset;
        }

        // Add individual style properties if specified
        if (color) newOverlay.color = color;
        if (backgroundColor) newOverlay.backgroundColor = backgroundColor;
        if (fontSize) newOverlay.fontSize = fontSize;
        if (fontFamily) newOverlay.fontFamily = fontFamily;
        if (fontWeight) newOverlay.fontWeight = fontWeight;
        if (textAlign) newOverlay.textAlign = textAlign;
        if (padding) newOverlay.padding = padding;
        if (borderRadius) newOverlay.borderRadius = borderRadius;
        if (shadow) newOverlay.shadow = shadow;

        // Add the overlay to the context
        addTextOverlay(newOverlay);

        setLastToolCall(
          `Added text overlay: "${text.substring(0, 20)}${
            text.length > 20 ? "..." : ""
          }"`
        );

        return {
          success: true,
          id,
          type: "text-overlay",
          text,
          at,
          duration,
          position: position || "center",
          success: true,
        };
      }

      // Handle update_text_overlay tool calls
      if (toolCall.name === "update_text_overlay") {
        const {
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
        } = toolCall.arguments;

        console.log(
          "🔧 update_text_overlay tool called with args:",
          toolCall.arguments
        );

        // Find the overlay to update
        let targetId = id;
        let foundOverlay;

        // PRIORITY 1: If an explicit ID is provided, use that
        if (targetId) {
          foundOverlay = textOverlays.find(
            (overlay) => overlay.id === targetId
          );
          if (!foundOverlay) {
            console.error(`Could not find overlay with ID ${targetId}`);
            // Fall back to search or most recent
            targetId = undefined;
          }
        }

        // PRIORITY 2: If search text is provided or ID wasn't found, use search
        if (!targetId && (searchText || !foundOverlay)) {
          const searchTerm = searchText || text || "";
          // Always get the most recent matching overlay
          foundOverlay = findTextOverlayByContent(textOverlays, searchTerm);

          if (foundOverlay) {
            targetId = foundOverlay.id;
            console.log(`Found overlay with id ${targetId} matching search`);
          } else {
            console.log(
              `Could not find any overlay to update using search"${
                searchText || text || "empty search"
              }"`
            );
          }
        }

        // Create an updates object with only the properties that are provided
        const updates: Partial<TextOverlay> = {};

        // Handle preset styles first
        if (preset) {
          console.log(
            `🎨 Setting preset style '${preset}' for text overlay ID: ${targetId}`
          );
          updates.preset = preset;
        }

        // Apply individual style overrides
        if (text) updates.text = text;
        if (at !== undefined) updates.at = at;
        if (duration !== undefined) updates.duration = duration;
        if (position) updates.position = position;
        if (color) updates.color = color;
        if (backgroundColor) updates.backgroundColor = backgroundColor;
        if (fontSize) updates.fontSize = fontSize;
        if (fontFamily) updates.fontFamily = fontFamily;
        if (fontWeight) updates.fontWeight = fontWeight;
        if (textAlign) updates.textAlign = textAlign;
        if (padding) updates.padding = padding;
        if (borderRadius) updates.borderRadius = borderRadius;
        if (shadow) updates.shadow = shadow;

        console.log(
          "🔍 Final updates to apply:",
          JSON.stringify(updates, null, 2)
        );
        console.log(
          "🎯 Before update - overlay state:",
          JSON.stringify(
            textOverlays.find((o) => o.id === targetId),
            null,
            2
          )
        );

        if (targetId) {
          // Update the overlay in context
          console.log(`Updating overlay with ID: ${targetId}`);
          updateTextOverlay(targetId, updates);

          // Verify the update was applied
          setTimeout(() => {
            console.log(
              "✅ After update - overlay state:",
              JSON.stringify(
                textOverlays.find((o) => o.id === targetId),
                null,
                2
              )
            );
          }, 0);

          setLastToolCall(
            `Updated text overlay${
              text
                ? ` to "${text.substring(0, 20)}${
                    text.length > 20 ? "..." : ""
                  }"`
                : ""
            }`
          );

          return {
            success: true,
            id: targetId,
            message: `Text overlay updated successfully`,
          };
        } else if (foundOverlay) {
          // We found an overlay by search but didn't set targetId for some reason
          console.log(
            `Updating overlay with ID: ${foundOverlay.id} (found by search)`
          );
          updateTextOverlay(foundOverlay.id, updates);

          setLastToolCall(
            `Updated text overlay${
              text
                ? ` to "${text.substring(0, 20)}${
                    text.length > 20 ? "..." : ""
                  }"`
                : ""
            }`
          );

          return {
            success: true,
            id: foundOverlay.id,
            message: `Text overlay updated successfully`,
          };
        } else {
          console.error("Could not find any text overlay to update");
          return {
            success: false,
            error: `Could not find text overlay to update`,
          };
        }
      }

      // Return null for unknown tool calls
      return null;
    },
    [
      setAspectRatio,
      textOverlays,
      addTextOverlay,
      updateTextOverlay,
      removeTextOverlay,
      findTextOverlay,
    ]
  );

  // For debugging - log when the set of processed IDs changes
  useEffect(() => {
    console.log("🔢 Current processed tool call IDs:", [
      ...processedToolCallIds,
    ]);
  }, [processedToolCallIds]);

  // Use the Vercel AI SDK's useChat hook for streaming support
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: aiHandleSubmit,
    isLoading,
    error,
  } = useChat({
    api: "/api/chat",
    maxSteps: 5, // Allow up to 5 tool calls in a single response
    onToolCall: handleToolCall,
    onFinish: (message: Message) => {
      console.log("Message finished:", message);

      // For backward compatibility, still process text responses for aspect ratio changes
      if (message.role === "assistant" && message.content) {
        processTextForAspectRatio(message.content);
      }

      // Check for tool invocations in the message and process them
      if (message.role === "assistant" && (message as any).toolInvocations) {
        const toolInvocations = (message as any).toolInvocations;
        console.log("Found tool invocations in message:", toolInvocations);

        // Process each tool invocation
        toolInvocations.forEach((invocation: any) => {
          // Skip if we've already processed this tool call
          if (processedToolCallIds.has(invocation.toolCallId)) {
            console.log(
              "Skipping already processed tool call in onFinish:",
              invocation.toolCallId
            );
            return;
          }

          // Handle remove_text_overlay tool calls
          if (
            invocation.toolName === "remove_text_overlay" &&
            invocation.state === "result"
          ) {
            console.log("Processing remove_text_overlay result:", invocation);

            const { id, searchText } = invocation.args || {};

            // Find the overlay to remove
            let targetId = id;
            let targetOverlay;

            // If no ID provided, try to find by searchText
            if (!targetId && searchText) {
              // Only attempt search if we have text overlays
              if (textOverlays.length > 0) {
                console.log(
                  `Searching for text overlay with term: "${searchText}"`
                );
                targetOverlay = findTextOverlayByContent(
                  textOverlays,
                  searchText
                );

                if (targetOverlay) {
                  targetId = targetOverlay.id;
                  console.log(
                    `Found overlay with id ${targetId} matching search`
                  );
                } else {
                  // If no match but we have overlays, just use the most recent one
                  const sortedOverlays = [...textOverlays].reverse();
                  targetOverlay = sortedOverlays[0];
                  targetId = targetOverlay.id;
                  console.log(
                    `No match found, removing most recent overlay: ${targetId}`
                  );
                }
              } else {
                console.log("No text overlays available to remove");
              }
            } else if (!targetId && textOverlays.length > 0) {
              // If neither ID nor searchText provided, just remove the most recent overlay
              const sortedOverlays = [...textOverlays].reverse();
              targetOverlay = sortedOverlays[0];
              targetId = targetOverlay.id;
              console.log(
                `No search criteria provided, removing most recent overlay: ${targetId}`
              );
            }

            if (targetId) {
              // Remove the overlay
              console.log(`Removing overlay with ID: ${targetId}`);
              removeTextOverlay(targetId);
              setLastToolCall(`Removed text overlay`);
            } else {
              console.log("Could not find any text overlay to remove");
            }

            // Mark this tool call as processed
            setProcessedToolCallIds(
              (prev) => new Set([...prev, invocation.toolCallId])
            );
          }

          // Handle add_text_overlay tool calls
          if (
            invocation.toolName === "add_text_overlay" &&
            invocation.state === "result"
          ) {
            console.log("Processing add_text_overlay result:", invocation);

            // Don't re-create text overlays if they were already created in handleToolCall
            // This prevents duplication of overlays
            if (invocation.result && invocation.result.id) {
              const existingOverlay = textOverlays.find(
                (o) => o.id === invocation.result.id
              );
              if (existingOverlay) {
                console.log(
                  "Text overlay already exists, not adding duplicate:",
                  existingOverlay.id
                );
                // Mark this tool call as processed
                setProcessedToolCallIds(
                  (prev) => new Set([...prev, invocation.toolCallId])
                );
                return;
              }
            }

            const { text, at, duration, position } = invocation.args;
            const result = invocation.result;

            // Generate a unique ID using our improved ID generation
            const now = new Date();
            const timestamp = now.getTime();
            const microTime = performance.now().toString().replace(".", "");
            const random = Math.random().toString(36).substring(2, 10);
            const id = result.id || `text_${timestamp}_${microTime}_${random}`;

            // Create a new overlay from the result
            const newOverlay: TextOverlay = {
              id,
              text: text,
              at: at,
              duration: duration,
              position: position || "center",
            };

            // Add preset if specified in the result
            if (result.preset) {
              newOverlay.preset = result.preset;
            }

            // Add the overlay to the context
            addTextOverlay(newOverlay);

            setLastToolCall(
              `Added text overlay: "${text.substring(0, 20)}${
                text.length > 20 ? "..." : ""
              }"`
            );

            // Mark this tool call as processed
            setProcessedToolCallIds(
              (prev) => new Set([...prev, invocation.toolCallId])
            );
          }

          // Handle update_text_overlay tool calls
          if (
            invocation.toolName === "update_text_overlay" &&
            invocation.state === "result"
          ) {
            console.log("Processing update_text_overlay result:", invocation);

            const {
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
            } = invocation.args || {};

            // Find the overlay to update
            let targetId = id;
            let targetOverlay;

            // If no ID provided, try to find by searchText or text property using our flexible search helper
            if (!targetId) {
              const searchTerm = searchText || text || "";

              // Only attempt search if we have text overlays and a search term
              if (textOverlays.length > 0) {
                console.log(
                  `Searching for text overlay with term: "${searchTerm}"`
                );
                targetOverlay = findTextOverlayByContent(
                  textOverlays,
                  searchTerm
                );

                if (targetOverlay) {
                  targetId = targetOverlay.id;
                  console.log(
                    `Found overlay with id ${targetId} matching search`
                  );
                } else if (textOverlays.length > 0) {
                  // If no match but we have overlays, just use the most recent one
                  const sortedOverlays = [...textOverlays].reverse();
                  targetOverlay = sortedOverlays[0];
                  targetId = targetOverlay.id;
                  console.log(
                    `No match found, using most recent overlay: ${targetId}`
                  );
                } else {
                  console.log("No text overlays available to update");
                }
              } else {
                console.log("No text overlays available to update");
              }
            }

            // Create an updates object with only the properties that are provided
            const updates: Partial<TextOverlay> = {};

            // Handle preset styles first
            if (preset) {
              console.log(
                `🎨 [onFinish] Setting preset style '${preset}' for text overlay ID: ${
                  targetId || targetOverlay?.id
                }`
              );
              updates.preset = preset;
            }

            // Apply individual style overrides
            if (text !== undefined) updates.text = text;
            if (at !== undefined) updates.at = at;
            if (duration !== undefined) updates.duration = duration;
            if (position !== undefined) updates.position = position;
            if (color !== undefined) updates.color = color;
            if (backgroundColor !== undefined)
              updates.backgroundColor = backgroundColor;
            if (fontSize !== undefined) updates.fontSize = fontSize;
            if (fontFamily !== undefined) updates.fontFamily = fontFamily;
            if (fontWeight !== undefined) updates.fontWeight = fontWeight;
            if (textAlign !== undefined) updates.textAlign = textAlign;
            if (padding !== undefined) updates.padding = padding;
            if (borderRadius !== undefined) updates.borderRadius = borderRadius;
            if (shadow !== undefined) updates.shadow = shadow;

            console.log(
              "🔍 [onFinish] Updates to apply:",
              JSON.stringify(updates, null, 2)
            );

            if (targetId) {
              // Update the overlay
              console.log(`Updating overlay with ID: ${targetId}`);
              updateTextOverlay(targetId, updates);

              // Verify the update was applied
              setTimeout(() => {
                console.log(
                  "✅ [onFinish] After update - overlay state:",
                  JSON.stringify(
                    textOverlays.find((o) => o.id === targetId),
                    null,
                    2
                  )
                );
              }, 0);

              setLastToolCall(
                `Updated text overlay${
                  text
                    ? ` to "${text.substring(0, 20)}${
                        text.length > 20 ? "..." : ""
                      }"`
                    : ""
                }`
              );
            } else if (targetOverlay) {
              // We found an overlay by search but didn't set targetId for some reason
              console.log(
                `Updating overlay with ID: ${targetOverlay.id} (found by search)`
              );
              updateTextOverlay(targetOverlay.id, updates);
              setLastToolCall(
                `Updated text overlay${
                  text
                    ? ` to "${text.substring(0, 20)}${
                        text.length > 20 ? "..." : ""
                      }"`
                    : ""
                }`
              );
            } else {
              console.error(
                "Could not find text overlay to update with search text:",
                searchText
              );
            }

            // Mark this tool call as processed
            setProcessedToolCallIds(
              (prev) => new Set([...prev, invocation.toolCallId])
            );
          }
        });
      }
    },
  });

  // Clear processed tool call IDs when we get a new user message
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      console.log("🧹 New user message - clearing processed tool call IDs");
      setProcessedToolCallIds(new Set());
    }
  }, [messages, setProcessedToolCallIds]);

  /**
   * Legacy method to process text responses for aspect ratio changes
   * This is a fallback for when the AI doesn't use the tool call
   */
  const processTextForAspectRatio = useCallback(
    (content: string) => {
      // Check for platform-related mentions first
      if (
        content.toLowerCase().includes("youtube") &&
        !content.toLowerCase().includes("9:16") &&
        !content.toLowerCase().includes("1:1")
      ) {
        const aspectRatioObject = aspectRatios.find((r) => r.value === "16:9");
        if (aspectRatioObject) {
          setAspectRatio(aspectRatioObject);
          setLastToolCall(`Changed aspect ratio to 16:9 for YouTube`);
        }
      } else if (
        (content.toLowerCase().includes("tiktok") ||
          content.toLowerCase().includes("reels")) &&
        !content.toLowerCase().includes("16:9") &&
        !content.toLowerCase().includes("1:1")
      ) {
        const aspectRatioObject = aspectRatios.find((r) => r.value === "9:16");
        if (aspectRatioObject) {
          setAspectRatio(aspectRatioObject);
          setLastToolCall(`Changed aspect ratio to 9:16 for vertical video`);
        }
      } else if (
        content.toLowerCase().includes("instagram") &&
        !content.toLowerCase().includes("reels") &&
        !content.toLowerCase().includes("16:9") &&
        !content.toLowerCase().includes("9:16")
      ) {
        const aspectRatioObject = aspectRatios.find((r) => r.value === "1:1");
        if (aspectRatioObject) {
          setAspectRatio(aspectRatioObject);
          setLastToolCall(`Changed aspect ratio to 1:1 for Instagram`);
        }
      }

      // Direct ratio mentions
      const aspectRatioRegex =
        /(?:changed|set|updated|change|set|update|using|chose|choose|selected|select|to|for)?\s*(?:the\s+)?(?:aspect\s+ratio\s+(?:to|of|as)\s+)?(\d+:\d+)\b/i;
      const match = content.match(aspectRatioRegex);

      if (match && match[1]) {
        const ratioValue = match[1] as AspectRatioValue;
        const aspectRatioObject = aspectRatios.find(
          (r) => r.value === ratioValue
        );

        if (aspectRatioObject) {
          setAspectRatio(aspectRatioObject);
          setLastToolCall(`Changed aspect ratio to ${ratioValue}`);
        }
      }
    },
    [setAspectRatio]
  );

  // Custom handleSubmit that wraps the AI SDK's handleSubmit
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      // Use the AI SDK's handleSubmit which handles streaming
      aiHandleSubmit(e);
    },
    [input, isLoading, aiHandleSubmit]
  );

  // Log any errors from the AI SDK
  useEffect(() => {
    if (error) {
      console.error("AI SDK error:", error);
    }
  }, [error]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    lastToolCall,
    error,
  };
}
