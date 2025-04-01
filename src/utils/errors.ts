/**
 * Custom error classes and error handling utilities
 */

/**
 * Base error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a configuration issue is detected
 */
export class ConfigError extends AppError {
  constructor(message: string) {
    super(`Configuration error: ${message}`);
  }
}

/**
 * Error thrown when an embedding API request fails
 */
export class EmbeddingError extends AppError {
  constructor(message: string) {
    super(`Embedding error: ${message}`);
  }
}

/**
 * Error thrown when a vector store operation fails
 */
export class VectorStoreError extends AppError {
  constructor(message: string) {
    super(`Vector store error: ${message}`);
  }
}

/**
 * Error thrown when a memory item is not found
 */
export class MemoryNotFoundError extends AppError {
  constructor(id: string) {
    super(`Memory with ID '${id}' not found`);
  }
}

/**
 * Error thrown when a provided parameter is invalid
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
  }
}

/**
 * Format an error for API responses
 * 
 * @param error - The error to format
 * @returns An object with error details suitable for API responses
 */
export function formatErrorResponse(error: unknown): { error: string; details?: string } {
  if (error instanceof AppError) {
    return {
      error: error.name,
      details: error.message,
    };
  }
  
  if (error instanceof Error) {
    return {
      error: 'UnexpectedError',
      details: error.message,
    };
  }
  
  return {
    error: 'UnknownError',
    details: String(error),
  };
}
