import { prisma } from './prisma';
import { createClient } from './supabase/server';

/** Resolve the signed-in application user and enforce the requested role. */
export async function requireUser(requiredRole) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) return null;

  const appUser = await prisma.user.findFirst({
    where: { supabaseAuthId: user.id, deletedAt: null },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      avatarUrl: true,
      phone: true,
      timeZone: true,
      tutorProfile: { select: { hourlyRateETB: true } },
    },
  });

  if (!appUser || (requiredRole && appUser.role !== requiredRole)) return null;
  return appUser;
}
