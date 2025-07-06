import { Movie } from "../../types";

/**
 * Removes duplicate items from an array of search results
 * @param {Array} results - Array of search result objects
 * @param {string} idKey - The key to use for identifying duplicates (default: 'id')
 * @param {string} mediaTypeKey - The key to check media type (default: 'media_type')
 * @returns {Array} Deduplicated array
 */
export const removeDuplicateResults = (results: any, idKey = "id", mediaTypeKey = "media_type") => {
  if (!results || !Array.isArray(results)) {
    return [];
  }

  const seen = new Map();

  return results.filter((item) => {
    if (!item || typeof item !== "object") return false;

    const itemId = item[idKey];
    const mediaType = item[mediaTypeKey] || "unknown";

    const key = `${itemId}_${mediaType}`;

    if (seen.has(key)) {
      return false; // Skip this duplicate
    } else {
      seen.set(key, true);
      return true;
    }
  });
};

export const removeAllDuplicates = (results: Movie[]) => {
  if (!results || !Array.isArray(results)) {
    return [];
  }

  const basicDeduplicated = removeDuplicateResults(results);

  const seenIds = new Set();
  const finalResults = [];

  for (const item of basicDeduplicated) {
    const id = item.id;

    // Skip items with no ID
    if (id === undefined || id === null) continue;

    if (seenIds.has(id)) {
      const existingItem = finalResults.find((r) => r.id === id);

      if (shouldReplace(existingItem, item)) {
        const index = finalResults.findIndex((r) => r.id === id);
        if (index !== -1) {
          finalResults.splice(index, 1);
        }
        finalResults.push(item);
      }
    } else {
      seenIds.add(id);
      finalResults.push(item);
    }
  }

  return finalResults;
};

function shouldReplace(existingItem: any, newItem: any) {
  if (!existingItem || !newItem) return true;

  if (!existingItem.poster_path && newItem.poster_path) return true;

  if (existingItem.genres?.length < newItem.genres?.length) return true;

  if ((existingItem.overview?.length || 0) < (newItem.overview?.length || 0)) return true;

  if ((existingItem.vote_count || 0) < (newItem.vote_count || 0)) return true;

  if (newItem.media_type === "movie" && existingItem.media_type === "tv") return true;

  return false;
}
