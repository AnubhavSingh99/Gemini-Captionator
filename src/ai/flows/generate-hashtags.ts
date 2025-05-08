export async function generateHashtags(caption: string): Promise<string[]> {
  // Placeholder implementation: generate hashtags by extracting keywords from caption
  // In real implementation, integrate with AI or NLP service to generate relevant hashtags

  if (!caption) return [];

  // Simple keyword extraction: split caption into words, filter common words, prefix with #
  const commonWords = new Set([
    "the", "and", "a", "an", "of", "in", "on", "for", "with", "to", "is", "are", "was", "were", "it", "this", "that"
  ]);

  const words = caption
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));

  // Take top 5 unique words as hashtags
  const uniqueWords = Array.from(new Set(words)).slice(0, 5);

  const hashtags = uniqueWords.map(word => `#${word}`);

  return hashtags;
}
