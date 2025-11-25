/**
 * Shared utilities for Firestore operations
 * Provides common error handling and helper functions
 */

import { db } from "@/lib/firebase";
import { CollectionReference, DocumentReference, FirestoreError } from "firebase/firestore";
import { logger } from "@/lib/logger";

/**
 * Execute a Firestore operation with consistent error handling
 * Returns null on error (instead of throwing)
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T | null> {
  if (!db) return null;
  try {
    return await operation();
  } catch (error) {
    logger.error(errorMessage, error);
    return null;
  }
}

/**
 * Execute a Firestore operation that returns a boolean
 * Returns false on error
 */
export async function withBooleanErrorHandling(
  operation: () => Promise<void>,
  errorMessage: string
): Promise<boolean> {
  if (!db) return false;
  try {
    await operation();
    return true;
  } catch (error) {
    logger.error(errorMessage, error);
    return false;
  }
}

/**
 * Execute a Firestore operation that returns an array
 * Returns empty array on error
 */
export async function withArrayErrorHandling<T>(
  operation: () => Promise<T[]>,
  errorMessage: string
): Promise<T[]> {
  if (!db) return [];
  try {
    return await operation();
  } catch (error) {
    logger.error(errorMessage, error);
    return [];
  }
}

