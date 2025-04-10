// Configure URL
const API_URL =
  "https://intexii-backend-d2cjhzbzbxdybgdp.eastus-01.azurewebsites.net/api/Rating";

// Create a rating data type
type UserRatingResponse = {
  rating: number | null;
  comment: string;
};

// Get the User Rating for an individual movie

export async function getUserRating(
  showId: string
): Promise<UserRatingResponse | null> {
  try {
    const response = await fetch(`${API_URL}/user/${showId}`, {
      credentials: "include",
    });

    if (response.status === 404 || response.status === 204) {
      return null; // No rating yet
    }

    if (!response.ok) {
      throw new Error("Failed to fetch rating");
    }

    const data = await response.json();
    return {
      rating: data.rating ?? null,
      comment: data.comment ?? "",
    };
  } catch (error) {
    console.error("Error fetching user rating:", error);
    return null;
  }
}

// Submit a new user rating for a movie
export async function submitUserRating(
  showId: string,
  rating: number,
  comment: string | null
) {
  const payload: any = { rating };
  if (comment !== null) {
    payload.comment = comment;
  }

  const response = await fetch(`${API_URL}/user/${showId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to submit rating");
  }
}
