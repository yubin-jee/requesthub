const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || res.statusText);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/auth/me"),

  // Requests
  listRequests: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<RequestItem[]>(`/requests${qs}`);
  },

  getCriticalPendingCount: () =>
    request<{ count: number }>("/requests/critical-pending"),

  getRequest: (id: string) => request<RequestDetail>(`/requests/${id}`),

  createRequest: (data: CreateRequestData) =>
    request<RequestItem>("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRequest: (id: string, data: Partial<CreateRequestData>) =>
    request<RequestItem>(`/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  transitionStatus: (id: string, status: string) =>
    request<RequestItem>(`/requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  addComment: (id: string, body: string) =>
    request<Comment>(`/requests/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface RequestItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  requester: { id: string; name: string; email: string };
  assignee: { id: string; name: string; email: string } | null;
  _count?: { comments: number };
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string };
}

export interface RequestDetail extends RequestItem {
  comments: Comment[];
}

export interface CreateRequestData {
  title: string;
  description: string;
  priority: string;
  category: string;
}
