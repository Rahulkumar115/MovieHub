import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

// Create a reusable Axios client
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// Fetch movies for the homepage
export const getTrendingMovies = async () => {
  try {
    const response = await tmdbClient.get('/trending/movie/day');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

// Fetch full details, including the trailer video and cast, for the booking page
export const getMovieDetails = async (id: number | string) => {
  try {
    // 'append_to_response' is a TMDB trick to get the movie info, trailer, and actors in a single API call!
    const response = await tmdbClient.get(`/movie/${id}`, {
      params: {
        append_to_response: 'videos,credits',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for movie ${id}:`, error);
    return null;
  }
};

// Fetch movies based on a user's search query
export const searchMovies = async (query: string) => {
  try {
    const response = await tmdbClient.get('/search/movie', {
      params: {
        query: query,
        include_adult: false, // Keep it clean!
      },
    });
    return response.data.results;
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    return [];
  }
};