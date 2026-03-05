/**
 * Helper functions for making authenticated API calls
 * Automatically includes user authentication headers
 */

interface FetchOptions extends RequestInit {
  user?: {
    email: string;
    role?: string;
  } | null;
}

/**
 * Get auth headers for API calls
 */
export function getAuthHeaders(user?: { email: string; role?: string } | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (user?.email) {
    headers['x-user-email'] = user.email;
    
    // Add admin header if user is admin
    if (user.role === 'admin' || isAdminEmail(user.email)) {
      headers['x-admin-email'] = user.email;
    }
  }

  return headers;
}

/**
 * Check if email is in admin list
 */
function isAdminEmail(email: string): boolean {
  const adminEmails = ['m.bolado79@gmail.com'];
  return adminEmails.includes(email);
}

/**
 * Make an authenticated fetch request
 */
export async function authFetch(
  url: string, 
  options: FetchOptions = {},
  user?: { email: string; role?: string } | null
): Promise<Response> {
  const authHeaders = getAuthHeaders(user);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });

  return response;
}

/**
 * Make an authenticated GET request
 */
export async function authGet(
  url: string,
  user?: { email: string; role?: string } | null
): Promise<Response> {
  return authFetch(url, { method: 'GET' }, user);
}

/**
 * Make an authenticated POST request
 */
export async function authPost(
  url: string,
  data: unknown,
  user?: { email: string; role?: string } | null
): Promise<Response> {
  return authFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  }, user);
}

/**
 * Make an authenticated PATCH request
 */
export async function authPatch(
  url: string,
  data: unknown,
  user?: { email: string; role?: string } | null
): Promise<Response> {
  return authFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, user);
}

/**
 * Make an authenticated DELETE request
 */
export async function authDelete(
  url: string,
  user?: { email: string; role?: string } | null
): Promise<Response> {
  return authFetch(url, { method: 'DELETE' }, user);
}
