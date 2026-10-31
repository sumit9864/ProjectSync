export class ApiError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // We use relative paths for the API so Next.js rewrite proxy handles it.
  // This ensures httpOnly cookies work without CORS issues.
  const url = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? '' : '/'}${path}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = data?.error || {};
    throw new ApiError(
      errorData.message || 'An unexpected error occurred',
      errorData.code || 'UNKNOWN_ERROR',
      response.status
    );
  }

  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}
