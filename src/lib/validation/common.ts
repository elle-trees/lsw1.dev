/**
 * Common validation utilities
 * Shared validation functions used across the application
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Returns validation result with message if invalid
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
}

/**
 * Validate display name
 * Returns validation result with message if invalid
 */
export function validateDisplayName(displayName: string): { valid: boolean; message?: string } {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return { valid: false, message: "Display name is required" };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: "Display name must be at least 2 characters long" };
  }
  if (trimmed.length > 50) {
    return { valid: false, message: "Display name must be 50 characters or less" };
  }
  return { valid: true };
}

/**
 * Validate time format (HH:MM:SS)
 */
export function validateTimeFormat(time: string): boolean {
  return /^\d{1,2}:\d{2}:\d{2}$/.test(time);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Validate that a string is not empty or only whitespace
 */
export function validateNotEmpty(value: string | undefined | null): boolean {
  return value !== undefined && value !== null && value.trim() !== "";
}

/**
 * Validate run type
 */
export function validateRunType(runType: string): boolean {
  return runType === "solo" || runType === "co-op";
}

/**
 * Validate leaderboard type
 */
export function validateLeaderboardType(leaderboardType: string): boolean {
  return leaderboardType === "regular" || 
         leaderboardType === "individual-level" || 
         leaderboardType === "community-golds";
}

