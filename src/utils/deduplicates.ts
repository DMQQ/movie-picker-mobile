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

