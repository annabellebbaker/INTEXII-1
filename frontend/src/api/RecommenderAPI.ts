import { Movie } from "../types/Movies";

// Configure URL
const API_URL =
  "https://intexii-backend-d2cjhzbzbxdybgdp.eastus-01.azurewebsites.net/api/Recommend";

// Get Recommendations based on the show ID using collaborative filtering
export async function fetchCollaborativeRecommendations(showId: string) {
  try {
    const response = await fetch(`${API_URL}/show/${showId}`, {
      credentials: "include",
    });

    if (response.status === 404 || response.status === 204) {
      return []; // No recommendations found
    }

    if (!response.ok) {
      throw new Error("Failed to fetch collaborative recommendations.");
    }

    return await response.json();
  } catch (error) {
    console.warn("Collaborative recommendations unavailable:", error);
    return []; // Fallback to empty array
  }
}

// Get Recommendations based on the show ID using content filtering
export async function fetchContentRecommendations(showId: string) {
  try {
    const response = await fetch(`${API_URL}/content/${showId}`, {
      credentials: "include",
    });

    if (response.status === 404 || response.status === 204) {
      return []; // No recommendations found
    }

    if (!response.ok) {
      throw new Error("Failed to fetch content recommendations.");
    }

    return await response.json();
  } catch (error) {
    console.warn("Content recommendations unavailable:", error);
    return []; // Fallback to empty array
  }
}

// Get Recommendations based on the user ID using both collaborative and content filtering (currently hardcoded)
export async function fetchUserRecommendations(
  userId: string
): Promise<Movie[]> {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 404 || response.status === 204) return [];

    if (!response.ok) throw new Error("Failed to fetch user recommendations");

    return await response.json();
  } catch (error) {
    console.warn("User recommendations unavailable:", error);
    return [];
  }
}
