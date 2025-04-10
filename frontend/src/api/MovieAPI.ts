import { Movie } from "../types/Movies";

// Configure URL
const API_URL = "https://localhost:5000/api/Movie";

// Get the JWT token from localStorage or sessionStorage
const getJwtToken = () => localStorage.getItem("jwt_token"); // or sessionStorage if you use that instead

// Return all movies in the database
export async function fetchAllMovies(): Promise<Movie[]> {
  const token = getJwtToken();
  const response = await fetch(`${API_URL}/GetAllTitles`, {
    credentials: "include", // Send cookies if necessary
    headers: {
      Authorization: token ? `Bearer ${token}` : "", // Include token in Authorization header
    },
  });

  if (!response.ok) throw new Error("Failed to fetch movies");
  return await response.json();
}

// Get the top 10 most trending movies
export async function fetchTrendingMovies(): Promise<Movie[]> {
  const token = getJwtToken();
  try {
    const response = await fetch(`${API_URL}/top10`, {
      credentials: "include",
      headers: {
        Authorization: token ? `Bearer ${token}` : "", // Include token in Authorization header
      },
    });

    if (!response.ok) throw new Error("Failed to fetch trending movies");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
}

// Get the movie details by a show_id
export async function fetchMovieById(showId: string) {
  const token = getJwtToken();
  const response = await fetch(`${API_URL}/Details/${showId}`, {
    credentials: "include",
    headers: {
      Authorization: token ? `Bearer ${token}` : "", // Include token in Authorization header
    },
  });

  if (!response.ok) {
    throw new Error("Movie not found");
  }

  const data = await response.json();
  return data;
}

// Get the user's favorite movies (those rated 5 stars)
export async function fetchFavoriteMovies(): Promise<Movie[]> {
  const token = getJwtToken();
  const response = await fetch(`${API_URL}/favorites`, {
    credentials: "include",
    headers: {
      Authorization: token ? `Bearer ${token}` : "", // Include token in Authorization header
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch favorite movies.");
  }

  return await response.json();
}

// Get the movies that have been rated by the user
export async function fetchRatedMovies(): Promise<Movie[]> {
  const token = getJwtToken();
  const response = await fetch(`${API_URL}/rated`, {
    credentials: "include",
    headers: {
      Authorization: token ? `Bearer ${token}` : "", // Include token in Authorization header
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch rated movies.");
  }

  return await response.json();
}
