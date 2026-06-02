const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  name: string;
};

const TOKEN_KEY = "project_f_token";
const USER_KEY = "project_f_user";

async function requestAuth(
  endpoint: "/auth/login" | "/auth/register",
  payload: LoginPayload | RegisterPayload
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Authentication request failed");
  }

  saveAuth(data);
  return data as AuthResponse;
}

export function loginUser(payload: LoginPayload) {
  return requestAuth("/auth/login", payload);
}

export function registerUser(payload: RegisterPayload) {
  return requestAuth("/auth/register", payload);
}

export function saveAuth(data: AuthResponse) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem(USER_KEY);
  return user ? (JSON.parse(user) as AuthUser) : null;
}

export function logoutUser() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function getProfile() {
  const token = getToken();

  if (!token) {
    throw new Error("You must be logged in to view your profile");
  }

  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load profile");
  }

  return data;
}
