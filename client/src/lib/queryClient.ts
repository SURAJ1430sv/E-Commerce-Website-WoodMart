import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse as JSON first
      const errorData = await res.json();
      if (errorData.message) {
        throw new Error(errorData.message);
      }
      throw new Error(JSON.stringify(errorData));
    } catch (jsonError) {
      // If not JSON, try to get text
      try {
        const text = await res.text();
        throw new Error(text || res.statusText || `Error ${res.status}`);
      } catch (textError) {
        // Fall back to status
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // For non-ok responses, we'll handle it but not throw
    // so the caller can access the response if needed
    if (!res.ok && method !== "GET") {
      console.warn(`API request failed: ${method} ${url} - Status: ${res.status}`);
    }
    
    return res;
  } catch (error) {
    console.error(`Network error with API request: ${method} ${url}`, error);
    throw new Error(`Network error: Unable to connect to server. Please check your connection.`);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        await throwIfResNotOk(res);
      }
      
      return await res.json();
    } catch (error) {
      console.error(`Query error for: ${queryKey[0]}`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
