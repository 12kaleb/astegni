import { describe, expect, it } from 'vitest';
import { signupSchema, tutorProfileUpdateSchema } from './validation';

describe('signupSchema', () => {
  it('accepts a valid adult student signup', () => {
    expect(signupSchema.safeParse({
      name: 'Aster Tesfaye', email: 'aster@example.com', password: 'secure-pass-123', role: 'student',
    }).success).toBe(true);
  });

  it('requires guardian details for minors', () => {
    expect(signupSchema.safeParse({
      name: 'Aster Tesfaye', email: 'aster@example.com', password: 'secure-pass-123', role: 'student', isMinor: true,
    }).success).toBe(false);
  });
});

describe('tutorProfileUpdateSchema', () => {
  it('rejects unexpected fields and empty changes', () => {
    expect(tutorProfileUpdateSchema.safeParse({ hourlyRateETB: -1 }).success).toBe(false);
    expect(tutorProfileUpdateSchema.safeParse({ admin: true }).success).toBe(false);
    expect(tutorProfileUpdateSchema.safeParse({}).success).toBe(false);
  });
});
