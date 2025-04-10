import { User } from "../types/User";

// Configure URL
const API_URL = "https://intexii-backend-d2cjhzbzbxdybgdp.eastus-01.azurewebsites.net"

// Register a user to the database (Create Account)
export async function registerUser(
    email: string,
    password: string
  ): Promise<{ ok: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/Account/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      let message = "Unknown error.";
      let data: any = {};
  
      const contentLength = response.headers.get("content-length");
      const contentType = response.headers.get("content-type");
  
      if (
        contentLength !== "0" &&
        contentType &&
        contentType.includes("application/json")
      ) {
        data = await response.json();
  
        if (data.errors && typeof data.errors === "object") {
          const firstKey = Object.keys(data.errors)[0];
          const firstMessage = data.errors[firstKey][0];
          message = firstMessage;
        } else if (data.title) {
          message = data.title;
        } else {
          message = "Registered successfully.";
        }
      } else {
        message = response.ok
          ? "Registered successfully."
          : "Unknown error during registration.";
      }
  
      return { ok: response.ok, message };
    } catch (err) {
      return { ok: false, message: "Network error." };
    }
};  


// Login the user
export async function loginUser(email: string, password: string, rememberMe: boolean): Promise<Response> {
    const loginUrl = rememberMe
      ? `${API_URL}/login?useCookies=true`
      : `${API_URL}/login?useSessionCookies=true`;
  
    const response = await fetch(loginUrl, {
      method: "POST",
      credentials: "include", // include cookies for auth
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    return response;
}
  

// Logout the user
export async function logoutUser(): Promise<Response> {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  
    return response;
}


// Make sure the user is authenticated before accessing content
export async function getAuthenticatedUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/pingauth`, {
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) return null;
  
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format");
      }
  
      const data = await response.json();
      if (data.email) return { email: data.email };
      return null;
    } catch (error) {
      console.error("Auth check failed:", error);
      return null;
    }
}  

// Get the user's email
export async function fetchCurrentUserEmail(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/Account/me`, {
      credentials: "include",
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.email;
  } catch {
    return null;
  }
}

// Get the user's assigned roles
export async function fetchUserRoles(): Promise<string[]> {
  const response = await fetch(`${API_URL}/Account/roles`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch roles.");
  return await response.json();
}
