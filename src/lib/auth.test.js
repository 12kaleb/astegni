import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./prisma', () => ({ prisma: { user: { findFirst: vi.fn() } } }));
vi.mock('./supabase/server', () => ({ createClient: vi.fn() }));

import { prisma } from './prisma';
import { createClient } from './supabase/server';
import { requireUser } from './auth';

describe('requireUser', () => {
  beforeEach(() => {
    createClient.mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'auth-id' } }, error: null }) } });
    prisma.user.findFirst.mockResolvedValue({ id: 'user-id', role: 'TUTOR' });
  });

  it('queries active users and returns the requested role', async () => {
    await expect(requireUser('TUTOR')).resolves.toMatchObject({ id: 'user-id', role: 'TUTOR' });
    expect(prisma.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { supabaseAuthId: 'auth-id', deletedAt: null } }));
  });

  it('rejects accounts without an active application user', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(requireUser()).resolves.toBeNull();
  });

  it('rejects mismatched roles', async () => {
    await expect(requireUser('ADMIN')).resolves.toBeNull();
  });
});
