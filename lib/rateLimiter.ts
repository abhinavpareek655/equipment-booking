// Simple in-memory rate limiter
// For production, consider using Redis or a database-backed solution

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface BruteForceEntry {
  attempts: number;
  lockedUntil?: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private bruteForce: Map<string, BruteForceEntry> = new Map();
  
  // Clean up old entries every 10 minutes
  constructor() {
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    
    // Clean rate limit entries
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetAt < now) {
        this.requests.delete(key);
      }
    }
    
    // Clean brute force entries
    for (const [key, entry] of this.bruteForce.entries()) {
      if (entry.lockedUntil && entry.lockedUntil < now) {
        this.bruteForce.delete(key);
      }
    }
  }

  /**
   * Check if a request is allowed based on rate limiting
   * @param identifier - Unique identifier (e.g., IP address or email)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if request is allowed, false otherwise
   */
  checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || entry.resetAt < now) {
      // Start new window
      this.requests.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Get remaining time until rate limit resets
   * @param identifier - Unique identifier
   * @returns seconds until reset, or 0 if not rate limited
   */
  getRateLimitReset(identifier: string): number {
    const entry = this.requests.get(identifier);
    if (!entry) return 0;
    
    const now = Date.now();
    if (entry.resetAt < now) return 0;
    
    return Math.ceil((entry.resetAt - now) / 1000);
  }

  /**
   * Track failed verification attempts and implement exponential lockout
   * @param identifier - Unique identifier (e.g., email)
   * @returns true if allowed to try, false if locked out
   */
  recordFailedAttempt(identifier: string): { allowed: boolean; lockedSeconds?: number } {
    const now = Date.now();
    const entry = this.bruteForce.get(identifier);

    if (!entry) {
      this.bruteForce.set(identifier, { attempts: 1 });
      return { allowed: true };
    }

    // Check if currently locked
    if (entry.lockedUntil && entry.lockedUntil > now) {
      const lockedSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
      return { allowed: false, lockedSeconds };
    }

    // Increment attempts
    entry.attempts++;

    // Implement exponential lockout after 3 failed attempts
    if (entry.attempts >= 3) {
      const lockoutDuration = Math.min(
        Math.pow(2, entry.attempts - 3) * 60 * 1000, // Exponential: 1min, 2min, 4min, etc.
        30 * 60 * 1000 // Max 30 minutes
      );
      entry.lockedUntil = now + lockoutDuration;
      return { allowed: false, lockedSeconds: Math.ceil(lockoutDuration / 1000) };
    }

    return { allowed: true };
  }

  /**
   * Clear failed attempts for an identifier (call on successful verification)
   */
  clearFailedAttempts(identifier: string): void {
    this.bruteForce.delete(identifier);
  }

  /**
   * Check if identifier is currently locked out
   */
  isLockedOut(identifier: string): { locked: boolean; seconds?: number } {
    const entry = this.bruteForce.get(identifier);
    if (!entry || !entry.lockedUntil) {
      return { locked: false };
    }

    const now = Date.now();
    if (entry.lockedUntil > now) {
      return { 
        locked: true, 
        seconds: Math.ceil((entry.lockedUntil - now) / 1000) 
      };
    }

    return { locked: false };
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();
