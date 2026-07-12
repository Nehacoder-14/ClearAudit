// 384-dimensional Hashing Vectorizer for local semantic search
export function getEmbedding(text = '') {
  const dimensions = 384;
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];

  // Stopwords list to filter out noisy terms
  const stopwords = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 
    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 
    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
  ]);

  // Extract word frequencies
  for (const word of words) {
    if (stopwords.has(word) || word.length < 2) continue;

    // Simple Jenkins-like hash function to map word to 0...383
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % dimensions;
    
    // Add frequency weight
    vector[index] += 1;
  }

  // Normalize the vector (L2 norm)
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  } else {
    // Return a random unit vector for empty text inputs to prevent division by zero
    for (let i = 0; i < dimensions; i++) {
      vector[i] = Math.random();
    }
    let rNorm = Math.sqrt(vector.reduce((sum, v) => sum + v*v, 0));
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / rNorm;
    }
  }

  return vector;
}

export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

// Find top matching snippets from a contract text based on a search query
export function getSemanticHighlights(content = '', query = '', limit = 3) {
  if (!content || !query) return [];
  const sentences = content.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 10);
  const queryEmbed = getEmbedding(query);
  
  const scoredSentences = sentences.map(sentence => {
    const sentenceEmbed = getEmbedding(sentence);
    const score = cosineSimilarity(queryEmbed, sentenceEmbed);
    return { sentence, score };
  });

  // Sort by score descending and take the top matching sentences
  return scoredSentences
    .filter(item => item.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
