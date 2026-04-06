import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchMovieByTitle } from '@/lib/tmdb';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    const aiPrompt = `You are a movie expert. User request: "${prompt}". 
    Provide exactly 5 movie titles. 
    You MUST respond ONLY with a raw JSON array of strings. 
    Example: ["Inception", "The Matrix", "Dune", "Avatar", "Alien"]`;

    const result = await model.generateContent(aiPrompt);
    const text = result.response.text();
    
    let movieTitles: string[] = [];

    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const parsedData = JSON.parse(arrayMatch[0]);
      movieTitles = parsedData.map((item: any) => typeof item === 'string' ? item : item.title || item.name);
    }

    const movies = [];
    for (const title of movieTitles) {
      if (!title) continue;
      
      let rawData = await searchMovieByTitle(title);
      
      // --- THE SELF-HEALING FIX ---
      // No matter what TMDB returns, we will dig down until we find the actual movie object!
      let movieData = rawData;
      if (rawData && rawData.data && rawData.data.results) movieData = rawData.data.results;
      else if (rawData && rawData.results) movieData = rawData.results[0];
      else if (Array.isArray(rawData)) movieData = rawData[0];

      // Now we strictly check if we successfully found an ID
      if (movieData && movieData.id) {
        console.log(`✅ Successfully added: ${movieData.title} (ID: ${movieData.id})`);
        movies.push(movieData);
      } else {
        console.log(`❌ Failed to extract ID for: ${title}`);
      }
    }

    return NextResponse.json({ movies });

  } catch (error) {
    console.error('AI Recommendation Error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}