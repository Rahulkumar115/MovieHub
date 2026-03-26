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
// Fetch full details, including trailer, cast, recommendations, and watch providers
export const getMovieDetails = async (id: number | string) => {
  try {
    const response = await tmdbClient.get(`/movie/${id}`, {
      params: {
        // We added 'images' and 'reviews' to the end of this list!
        append_to_response: 'videos,credits,recommendations,watch/providers,images,reviews',
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

// Fetch actor/person details and the movies they've starred in
export const getPersonDetails = async (id: number | string) => {
  try {
    const response = await tmdbClient.get(`/person/${id}`, {
      params: {
        append_to_response: 'movie_credits', // Pulls in all their movies!
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for person ${id}:`, error);
    return null;
  }
};

// Fetch movies currently playing in theaters
export const getNowPlayingMovies = async () => {
  try {
    const response = await tmdbClient.get('/movie/now_playing');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    return [];
  }
};

// Fetch generally popular movies (Fan Favorites)
export const getPopularMovies = async () => {
  try {
    const response = await tmdbClient.get('/movie/popular');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

// Fetch all-time top-rated movies (Top Picks)
export const getTopRatedMovies = async () => {
  try {
    const response = await tmdbClient.get('/movie/top_rated');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};