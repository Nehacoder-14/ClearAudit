import { NextResponse } from 'next/server';
import { getContracts, saveContract } from '@/lib/db';
import { getEmbedding, cosineSimilarity, getSemanticHighlights } from '@/lib/embeddings';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const contracts = await getContracts();

    if (!query || query.trim() === '') {
      return NextResponse.json({ success: true, contracts });
    }

    // Run local semantic search using Hashing Vectorizer and Cosine Similarity
    const queryEmbed = getEmbedding(query);

    const scoredContracts = contracts.map(contract => {
      let score = 0;
      if (contract.embedding && contract.embedding.length > 0) {
        score = cosineSimilarity(queryEmbed, contract.embedding);
      } else {
        // Fallback similarity using string matching
        const normalizedContent = contract.content.toLowerCase();
        const normalizedQuery = query.toLowerCase();
        if (normalizedContent.includes(normalizedQuery)) score = 0.5;
      }

      // Extract matching clauses
      const highlights = getSemanticHighlights(contract.content, query, 2);

      return {
        ...contract,
        similarityScore: score,
        highlights: highlights.map(h => h.sentence)
      };
    });

    // Sort by score descending
    const results = scoredContracts
      .filter(c => c.similarityScore > 0.02)
      .sort((a, b) => b.similarityScore - a.similarityScore);

    return NextResponse.json({
      success: true,
      query,
      contracts: results
    });

  } catch (e) {
    console.error("Contracts API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Save/update contract details
    const saved = await saveContract(body);
    return NextResponse.json({ success: true, contract: saved });
  } catch (e) {
    console.error("Save Contract API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
