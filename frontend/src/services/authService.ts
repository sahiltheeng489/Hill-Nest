import { buildApiUrl } from "@/services/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  emailVerified: boolean;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
  emailVerification?: {
    required: boolean;
    expiresIn: string;
    devUrl: string;
  };
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
  const response = await fetch(buildApiUrl(endpoint), {
    method: "POST",
    credentials: "include",
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

  void fetch(buildApiUrl("/auth/logout"), {
    method: "POST",
    credentials: "include",
  });
}

export async function refreshSession() {
  const response = await fetch(buildApiUrl("/auth/refresh"), {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    logoutUser();
    throw new Error(data.message || "Session refresh failed");
  }

  saveAuth(data);
  return data as AuthResponse;
}

export async function getProfile() {
  let token = getToken();

  if (!token) {
    const session = await refreshSession();
    token = session.token;
  }

  let response = await fetch(buildApiUrl("/profile"), {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    const session = await refreshSession();
    response = await fetch(buildApiUrl("/profile"), {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load profile");
  }

  return data;
}
