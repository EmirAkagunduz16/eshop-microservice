export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found error
export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: any) {
    super(message, 404, true, details);
  }
}

// validation error (use for Joi/zod/etc. validation errors)
export class ValidationError extends AppError {
  constructor(message = "Validation error", details?: any) {
    super(message, 400, true, details);
  }
}

// authentication error
export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed", details?: any) {
    super(message, 401, true, details);
  }
}

// forbidden error
export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden", details?: any) {
    super(message, 403, true, details);
  }
}

// database error
export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any) {
    super(message, 500, true, details);
  }
}

// Rate limit error
export class RateLimitError extends AppError {
  constructor(message = "Too many requests", details?: any) {
    super(message, 429, true, details);
  }
}

// authorization error
export class AuthorizationError extends AppError {
  constructor(message = "Not authorized", details?: any) {
    super(message, 403, true, details);
  }
}
