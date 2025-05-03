import { AspectRatioValue } from "../types";
import { aspectRatios } from "./aspect-ratios";

type AspectRatioToolParams = {
  platform?: string;
  ratio?: AspectRatioValue;
};

export async function handleAspectRatioChange({
  platform,
  ratio,
}: AspectRatioToolParams) {
  let selectedRatioValue: AspectRatioValue = ratio || "16:9";
  let reason = "";

  // If platform is specified but ratio isn't, determine ratio from platform
  if (platform && !ratio) {
    const platformLower = platform.toLowerCase();

    if (
      platformLower.includes("tiktok") ||
      platformLower.includes("instagram reel") ||
      platformLower.includes("story") ||
      platformLower.includes("vertical")
    ) {
      selectedRatioValue = "9:16";
      reason = `This is the optimal vertical format for ${platform}.`;
    } else if (
      platformLower.includes("youtube") ||
      platformLower.includes("landscape") ||
      platformLower.includes("traditional")
    ) {
      selectedRatioValue = "16:9";
      reason = `This is the standard landscape format for ${platform}.`;
    } else if (
      platformLower.includes("square") ||
      platformLower.includes("instagram post")
    ) {
      selectedRatioValue = "1:1";
      reason = `A square format works best for ${platform}.`;
    } else if (
      platformLower.includes("cinematic") ||
      platformLower.includes("film") ||
      platformLower.includes("movie")
    ) {
      selectedRatioValue = "21:9";
      reason = `This ultrawide format gives a cinematic feel perfect for ${platform}.`;
    } else if (
      platformLower.includes("tv") ||
      platformLower.includes("classic")
    ) {
      selectedRatioValue = "4:3";
      reason = `This is the classic format used for ${platform}.`;
    } else {
      // Default to 16:9 if platform is unknown
      reason = `I've set a standard 16:9 ratio which works well for most video content.`;
    }
  } else if (ratio) {
    // If ratio is directly specified
    selectedRatioValue = ratio;
    reason = `I've set the aspect ratio to ${ratio} as requested.`;
  }

  // Find the AspectRatio object that matches the selected value
  const aspectRatioObject = aspectRatios.find(
    (r) => r.value === selectedRatioValue
  );

  return {
    ratio: selectedRatioValue,
    ratioObject: aspectRatioObject,
    reason,
  };
}
