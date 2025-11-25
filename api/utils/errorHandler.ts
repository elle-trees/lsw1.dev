/**
 * Standardized error handling for API routes
 */

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Validates required query parameters
 */
export function validateQueryParams(
  searchParams: URLSearchParams,
  required: string[]
): { valid: true } | { valid: false; error: Response } {
  const missing: string[] = [];
  
  for (const param of required) {
    const value = searchParams.get(param);
    if (!value || value.trim() === '') {
      missing.push(param);
    }
  }
  
  if (missing.length > 0) {
    return {
      valid: false,
      error: createErrorResponse(
        `Missing required parameters: ${missing.join(', ')}`,
        400,
        'MISSING_PARAMETERS'
      ),
    };
  }
  
  return { valid: true };
}

/**
 * Wraps an API handler with standardized error handling
 */
export async function handleApiRequest<T>(
  handler: () => Promise<Response>,
  context: string
): Promise<Response> {
  try {
    return await handler();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[API] Error in ${context}:`, error);
    return createErrorResponse(
      'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

