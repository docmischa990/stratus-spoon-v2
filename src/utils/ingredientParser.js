// Units and stop words to strip from ingredient strings
const UNITS = new Set([
  'g', 'kg', 'ml', 'l', 'dl', 'cl',
  'tbsp', 'tsp', 'cup', 'cups', 'oz', 'lb', 'lbs',
  'handful', 'pinch', 'slice', 'slices', 'clove', 'cloves',
  'piece', 'pieces', 'bunch', 'sprig', 'sprigs', 'can', 'tin',
  'packet', 'bag', 'drop', 'drops', 'dash', 'sheet', 'sheets',
])

const STOP_WORDS = new Set([
  'and', 'or', 'the', 'a', 'an', 'of', 'to', 'with', 'for',
  'in', 'at', 'by', 'as', 'on', 'up', 'into', 'from',
  'about', 'over', 'then', 'some', 'more',
])

// Fraction unicode characters
const FRACTION_RE = /[\u00bc-\u00be\u2150-\u215e\u2189]/g

// Numbers, decimals, fractions written as digits
const NUMBER_RE = /\d+(\.\d+)?(\/\d+)?/g

// Punctuation except hyphens (hyphens connect compound words like "stir-fry")
const PUNCTUATION_RE = /[()[\]{},!?.;:'"]/g

/**
 * Extracts meaningful ingredient keywords from an array of ingredient strings.
 * e.g. ["200g beef mince", "2 eggs", "1 tbsp olive oil"]
 *   → ["beef", "mince", "eggs", "olive", "oil"]
 *
 * @param {string[]} ingredients
 * @returns {string[]} deduplicated keyword array
 */
export function extractIngredientKeywords(ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) return []

  const keywords = new Set()

  for (const ingredient of ingredients) {
    if (typeof ingredient !== 'string') continue

    const cleaned = ingredient
      .toLowerCase()
      .replace(FRACTION_RE, '')
      .replace(NUMBER_RE, '')
      .replace(PUNCTUATION_RE, '')
      .trim()

    const words = cleaned.split(/\s+/).filter(Boolean)

    for (const word of words) {
      const stripped = word.replace(/^-+|-+$/g, '') // strip leading/trailing hyphens
      if (
        stripped.length >= 3 &&
        !UNITS.has(stripped) &&
        !STOP_WORDS.has(stripped)
      ) {
        keywords.add(stripped)
      }
    }
  }

  return Array.from(keywords)
}
