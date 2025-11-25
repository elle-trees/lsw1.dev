/**
 * Standardized error handling utilities
 * Provides consistent error handling patterns across the codebase
 */

import { getErrorMessage, isError, isFirebaseAuthError } from './errorUtils';
import { logger } from './logger';

/**
 * Error handling result type
 */
export type ErrorResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Wraps an async function with standardized error handling
 * Returns a result object instead of throwing
 */
export async function handleError<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<ErrorResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    const errorCode = isFirebaseAuthError(error) ? error.code : undefined;
    
    // Log error with context
    if (context) {
      logger.error(`[${context}] ${errorMessage}`, error);
    } else {
      logger.error(errorMessage, error);
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: errorCode
    };
  }
}

/**
 * Wraps a sync function with standardized error handling
 */
export function handleErrorSync<T>(
  fn: () => T,
  context?: string
): ErrorResult<T> {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    const errorCode = isFirebaseAuthError(error) ? error.code : undefined;
    
    if (context) {
      logger.error(`[${context}] ${errorMessage}`, error);
    } else {
      logger.error(errorMessage, error);
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: errorCode
    };
  }
}

/**
 * Executes a function and logs errors without throwing
 * Useful for non-critical operations that shouldn't break the flow
 */
export async function executeSafely<T>(
  fn: () => Promise<T>,
  context?: string,
  defaultValue?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    if (context) {
      logger.warn(`[${context}] ${errorMessage}`, error);
    } else {
      logger.warn(errorMessage, error);
    }
    return defaultValue;
  }
}

/**
 * Executes a sync function and logs errors without throwing
 */
export function executeSafelySync<T>(
  fn: () => T,
  context?: string,
  defaultValue?: T
): T | undefined {
  try {
    return fn();
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    if (context) {
      logger.warn(`[${context}] ${errorMessage}`, error);
    } else {
      logger.warn(errorMessage, error);
    }
    return defaultValue;
  }
}

/**
 * Type guard for ErrorResult
 */
export function isSuccess<T>(result: ErrorResult<T>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard for ErrorResult failure
 */
export function isFailure<T>(result: ErrorResult<T>): result is { success: false; error: string; code?: string } {
  return result.success === false;
}

