import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const profiles = await prisma.tutorProfile.findMany({
      where: {
        openForStudents: true,
        isVerified: true,
      },
      orderBy: { rating: 'desc' },
      select: {
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
        hourlyRateUSD: true,
        bio: true,
        rating: true,
        reviewsCount: true,
        isVerified: true,
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const tutors = profiles.map((profile) => ({
      id: profile.id,
      name: profile.user.name,
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
      hourlyRateUSD: profile.hourlyRateUSD,
      bio: profile.bio ?? '',
      rating: profile.rating,
      reviewsCount: profile.reviewsCount,
      verified: profile.isVerified,
      badge: 'Verified',
      availableSlots: [],
    }));

    return Response.json(tutors);
  } catch (error) {
    console.error('Failed to load tutors:', error);
    return Response.json(
      { error: 'Unable to load tutors.' },
      { status: 500 }
    );
  }
}