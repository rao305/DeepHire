export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
};

export function successResponse<T>(data: T, status = 200): Response {
  return Response.json(
    {
      success: true,
      data,
    } satisfies ApiResponse<T>,
    { status }
  );
}

export function errorResponse(message: string, status: number, code?: string): Response {
  return Response.json(
    {
      success: false,
      error: message,
      code,
    } satisfies ApiResponse<never>,
    { status }
  );
}

export function validationError(errors: Record<string, string>): Response {
  return Response.json(
    {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      data: errors,
    } satisfies ApiResponse<Record<string, string>>,
    { status: 422 }
  );
}

export function notFoundError(resource: string): Response {
  return errorResponse(`${resource} not found`, 404, 'NOT_FOUND');
}

export function unauthorizedError(): Response {
  return errorResponse('Authentication required', 401, 'UNAUTHORIZED');
}

export function forbiddenError(): Response {
  return errorResponse('You do not have permission to access this resource', 403, 'FORBIDDEN');
}

export function serverError(error: unknown): Response {
  console.error('Unhandled API error:', error);
  return errorResponse('An unexpected error occurred', 500, 'INTERNAL_SERVER_ERROR');
}
