import { prisma } from './prisma';

function formatTutor(profile, includeSafetyId = false) {
  return {
    id: profile.id,
    name: profile.user.name,
    ...(includeSafetyId ? { userId: profile.user.id, timeZone: profile.user.timeZone } : {}),
    avatar: profile.user.avatarUrl,
    title: profile.title ?? '',
    university: profile.university ?? '',
    experienceYears: profile.experienceYears,
    location: profile.location ?? '',
    modes: profile.modes,
    gradeLevels: profile.gradeLevels,
    languages: profile.languages,
    subjects: profile.subjects,
    hourlyRateETB: profile.hourlyRateETB,
    bio: profile.bio ?? '',
    rating: profile.rating,
    reviewsCount: profile.reviewsCount,
    verified: profile.isVerified,
    badge: 'Verified',
    availableSlots: [],
    reviews: profile.reviews?.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      studentName: 'Student',
    })) ?? [],
  };
}

const publicTutorSelect = {
  id: true,
  title: true,
  university: true,
  experienceYears: true,
  location: true,
  modes: true,
  gradeLevels: true,
  languages: true,
  subjects: true,
  hourlyRateETB: true,
  bio: true,
  rating: true,
  reviewsCount: true,
  isVerified: true,
  user: { select: { id: true, name: true, avatarUrl: true, timeZone: true } },
};

export async function getPublicTutors() {
  const profiles = await prisma.tutorProfile.findMany({
    where: { openForStudents: true, isVerified: true },
    orderBy: [{ rating: 'desc' }, { user: { name: 'asc' } }],
    select: publicTutorSelect,
  });

  return profiles.map(formatTutor);
}

export async function searchPublicTutors({ page = 1, pageSize = 12, search, subject, minPrice, maxPrice, language, mode } = {}) {
  const filters = [
    { openForStudents: true, isVerified: true },
    ...(subject ? [{ subjects: { has: subject } }] : []),
    ...(language ? [{ languages: { has: language } }] : []),
    ...(mode ? [{ modes: { has: mode } }] : []),
    ...(minPrice !== undefined || maxPrice !== undefined ? [{ hourlyRateETB: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } }] : []),
    ...(search ? [{ OR: [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { title: { contains: search, mode: 'insensitive' } },
      { bio: { contains: search, mode: 'insensitive' } },
      { subjects: { has: search } },
    ] }] : []),
  ];
  const where = { AND: filters };
  const [total, profiles] = await Promise.all([
    prisma.tutorProfile.count({ where }),
    prisma.tutorProfile.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { user: { name: 'asc' } }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: publicTutorSelect,
    }),
  ]);
  return {
    tutors: profiles.map(formatTutor),
    pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
  };
}

export async function getPublicTutorById(id) {
  const profile = await prisma.tutorProfile.findFirst({
    where: { id, openForStudents: true, isVerified: true },
    select: publicTutorSelect,
  });
  if (!profile) return null;

  const reviews = await prisma.review.findMany({
    where: { tutorId: profile.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, rating: true, comment: true, createdAt: true },
  });
  return formatTutor({ ...profile, reviews }, true);
}
