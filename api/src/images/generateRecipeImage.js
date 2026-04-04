"use strict";

const {HttpsError} = require("firebase-functions/v2/https");

function buildRecipeImagePrompt(title, description = "") {
  const normalizedTitle = String(title || "").trim();
  const normalizedDescription = String(description || "").trim();

  if (!normalizedTitle) {
    throw new Error("Recipe title is required for AI image generation.");
  }

  const ambiguityHints = [
    "bowl",
    "plate",
    "surprise",
    "special",
    "delight",
    "mix",
    "fusion",
    "style",
  ];
  const shouldLeanOnDescription =
    normalizedTitle.split(/\s+/).length <= 2 ||
    ambiguityHints.some((hint) => normalizedTitle.toLowerCase().includes(hint));

  const promptSections = [
    `Professional food photography of ${normalizedTitle}, plated beautifully,`,
    "photorealistic food photography for a modern recipe website hero image.",
    "Use warm daylight, believable textures, and clean restaurant-quality presentation on a simple surface.",
    "Do not include text, labels, watermarks, extra hands, or unrelated objects.",
  ];

  if (normalizedDescription) {
    promptSections.push(
      shouldLeanOnDescription
        ? `Use this description to disambiguate the dish and guide the appearance: ${normalizedDescription}`
        : `Use this recipe description for extra visual cues only if it helps accuracy: ${normalizedDescription}`,
    );
  }

  promptSections.push(
    "Prioritize the actual dish implied by the title. If the description clarifies ingredients, cuisine, plating, or serving style, reflect that in the image.",
  );

  return promptSections.join(" ");
}

async function generateAndStoreRecipeImage({title, description}) {
  buildRecipeImagePrompt(title, description);

  throw new HttpsError(
      "failed-precondition",
      "AI image generation is not configured yet. Connect your custom image server to this function.",
  );
}

module.exports = {
  buildRecipeImagePrompt,
  generateAndStoreRecipeImage,
};
