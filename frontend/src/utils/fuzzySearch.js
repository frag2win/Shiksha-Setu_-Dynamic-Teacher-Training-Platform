/**
 * Fuzzy Search Utility
 * Handles typos, partial matches, and flexible searching
 */

/**
 * Calculate Levenshtein distance between two strings
 * Used to measure similarity and handle typos
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1].toLowerCase() === str2[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1 range)
 */
function similarityScore(str1, str2) {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
}

/**
 * Check if text matches query with fuzzy logic
 * @param {string} text - Text to search in
 * @param {string} query - Search query
 * @param {number} threshold - Similarity threshold (0-1)
 * @returns {object} - { matches: boolean, score: number }
 */
export function fuzzyMatch(text, query, threshold = 0.6) {
  if (!text || !query) return { matches: false, score: 0 };

  text = text.toLowerCase().trim();
  query = query.toLowerCase().trim();

  // Exact match gets highest score
  if (text.includes(query)) {
    return { matches: true, score: 1 };
  }

  // Check word-by-word matching
  const textWords = text.split(/\s+/);
  const queryWords = query.split(/\s+/);

  let maxScore = 0;

  // Check if query words match any text words
  for (const queryWord of queryWords) {
    for (const textWord of textWords) {
      // Partial word match
      if (textWord.startsWith(queryWord) || queryWord.startsWith(textWord)) {
        maxScore = Math.max(maxScore, 0.85);
      }
      
      // Fuzzy word match
      const score = similarityScore(textWord, queryWord);
      maxScore = Math.max(maxScore, score);
    }
  }

  // Check consecutive word matching
  const queryPhrase = queryWords.join(' ');
  for (let i = 0; i <= textWords.length - queryWords.length; i++) {
    const textPhrase = textWords.slice(i, i + queryWords.length).join(' ');
    const score = similarityScore(textPhrase, queryPhrase);
    maxScore = Math.max(maxScore, score);
  }

  return {
    matches: maxScore >= threshold,
    score: maxScore
  };
}

/**
 * Search through items with multiple fields
 * @param {Array} items - Array of objects to search
 * @param {string} query - Search query
 * @param {Array} fields - Field names to search in
 * @param {number} threshold - Similarity threshold
 * @returns {Array} - Filtered and sorted items
 */
export function fuzzySearch(items, query, fields, threshold = 0.5) {
  if (!query || query.trim() === '') {
    return items;
  }

  const results = items.map(item => {
    let bestScore = 0;
    let matchedFields = [];

    for (const field of fields) {
      const value = getNestedValue(item, field);
      if (value) {
        const { matches, score } = fuzzyMatch(String(value), query, threshold);
        if (matches) {
          matchedFields.push(field);
          bestScore = Math.max(bestScore, score);
        }
      }
    }

    return {
      item,
      score: bestScore,
      matchedFields,
      matches: bestScore > 0
    };
  });

  // Filter and sort by score
  return results
    .filter(r => r.matches)
    .sort((a, b) => b.score - a.score)
    .map(r => r.item);
}

/**
 * Get nested object value by dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Highlight matching text in search results
 * @param {string} text - Original text
 * @param {string} query - Search query
 * @returns {string} - HTML with highlighted matches
 */
export function highlightMatch(text, query) {
  if (!query || !text) return text;

  const queryWords = query.toLowerCase().split(/\s+/);
  let result = text;

  for (const word of queryWords) {
    const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
    result = result.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  return result;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize text for search (remove accents, special chars)
 */
export function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, ' ') // Replace special chars with space
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
