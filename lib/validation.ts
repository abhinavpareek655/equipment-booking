// lib/validation.ts - Input validation and sanitization utilities

import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .regex(/^[^\s@]+@curaj\.ac\.in$/i, "Must be a valid university email address");

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[@$!%*?&#^()_\-+=[\]{};':"\\|,.<>/?]/, "Password must contain at least one special character");

// Name validation schema
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

// Department validation schema
export const departmentSchema = z.enum([
  "Biochemistry",
  "Molecular Biology", 
  "Microbiology",
  "Genetics",
  "Biotechnology"
]);

// Role validation schema
export const roleSchema = z.enum([
  "Faculty",
  "Researcher", 
  "PhD Scholar",
  "MSc Student",
  "Technical Staff"
]);

// Equipment validation schema
export const equipmentSchema = z.object({
  name: z.string().min(1, "Equipment name is required").max(200),
  department: departmentSchema,
  category: z.string().optional(),
  location: z.string().optional(),
  contact: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

// Booking validation schema
export const bookingSchema = z.object({
  equipmentId: z.string().min(1, "Equipment ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid time format"),
  duration: z.number().min(0.5).max(24, "Duration must be between 0.5 and 24 hours"),
  supervisor: z.string().min(1, "Supervisor is required"),
  department: departmentSchema,
  purpose: z.string().min(10, "Purpose must be at least 10 characters").max(500),
});

// OTP validation schema
export const otpSchema = z
  .string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only digits");

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function validateAndSanitizeInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => e.message) 
      };
    }
    return { success: false, errors: ["Validation failed"] };
  }
}

// Rate limiting helper
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const record = requests.get(identifier);
    
    if (!record || now > record.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  };
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length > 0;
}

// File upload validation
export function validateFileUpload(
  file: File,
  maxSize: number = 5 * 1024 * 1024, // 5MB default
  allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp"]
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return { valid: false, error: "File size too large" };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type" };
  }
  
  return { valid: true };
} 