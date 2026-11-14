import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const [students, availableTutors, completedLessons, ratedTutors] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.tutorProfile.count({ where: { isVerified: true, openForStudents: true } }),
      prisma.lesson.count({ where: { status: 'COMPLETED' } }),
      prisma.tutorProfile.aggregate({
        where: { isVerified: true, openForStudents: true, reviewsCount: { gt: 0 } },
        _avg: { rating: true },
      }),
    ]);

    return NextResponse.json({
      students,
      availableTutors,
      completedLessons,
      averageTutorRating: ratedTutors._avg.rating,
    });
  } catch (error) {
    console.error('Public platform stats failed:', error);
    return NextResponse.json({ error: 'Unable to load platform statistics.' }, { status: 500 });
  }
}
