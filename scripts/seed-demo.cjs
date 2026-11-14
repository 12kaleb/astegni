const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('node:crypto');

if (process.env.ALLOW_DEMO_SEED !== 'true') {
  throw new Error('Refusing to seed: set ALLOW_DEMO_SEED=true after confirming this is a disposable environment.');
}
if (!process.env.SEED_DATABASE_URL) {
  throw new Error('Set SEED_DATABASE_URL to the development or staging database explicitly.');
}

const prisma = new PrismaClient({ datasources: { db: { url: process.env.SEED_DATABASE_URL } } });

async function ensureUser(email, name, role) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return prisma.user.update({ where: { id: existing.id }, data: { name, role, deletedAt: null } });
  return prisma.user.create({ data: { email, name, role, supabaseAuthId: randomUUID() } });
}

async function main() {
  const [student, tutor, admin] = await Promise.all([
    ensureUser('demo-student@astegni.test', 'Demo Student', 'STUDENT'),
    ensureUser('demo-tutor@astegni.test', 'Demo Tutor', 'TUTOR'),
    ensureUser('demo-admin@astegni.test', 'Demo Admin', 'ADMIN'),
  ]);

  const profile = await prisma.tutorProfile.upsert({
    where: { userId: tutor.id },
    create: {
      userId: tutor.id, title: 'Mathematics tutor', university: 'Demo University', location: 'Addis Ababa',
      subjects: ['Mathematics'], languages: ['Amharic', 'English'], modes: ['ONLINE'], gradeLevels: ['Grade 11'],
      hourlyRateETB: 500, bio: 'Fictional demo tutor profile.', openForStudents: true,
      isVerified: false, verificationStatus: 'PENDING',
    },
    update: { title: 'Mathematics tutor', subjects: ['Mathematics'], isVerified: false, verificationStatus: 'PENDING', openForStudents: true },
  });

  await prisma.availability.createMany({
    data: Array.from({ length: 7 }, (_, weekday) => ({ tutorId: tutor.id, weekday, startMinute: 9 * 60, endMinute: 17 * 60 })),
    skipDuplicates: true,
  });

  const completedAt = new Date();
  completedAt.setDate(completedAt.getDate() - 7);
  const completedLesson = await prisma.lesson.upsert({
    where: { id: 'demo-completed-lesson' },
    create: { id: 'demo-completed-lesson', title: 'Demo Mathematics', scheduledAt: completedAt, status: 'COMPLETED', studentId: student.id, tutorId: tutor.id },
    update: { scheduledAt: completedAt, status: 'COMPLETED', studentId: student.id, tutorId: tutor.id },
  });

  await prisma.review.upsert({
    where: { lessonId: completedLesson.id },
    create: { lessonId: completedLesson.id, studentId: student.id, tutorId: tutor.id, rating: 5, comment: 'Fictional demo review.' },
    update: { studentId: student.id, tutorId: tutor.id, rating: 5, comment: 'Fictional demo review.' },
  });
  await prisma.tutorProfile.update({ where: { id: profile.id }, data: { rating: 5, reviewsCount: 1 } });

  await prisma.assignment.upsert({
    where: { id: 'demo-assignment' },
    create: { id: 'demo-assignment', title: 'Demo practice problems', dueDate: new Date(Date.now() + 7 * 86400_000), studentId: student.id, tutorId: tutor.id },
    update: { studentId: student.id, tutorId: tutor.id },
  });

  console.log('Demo records are ready:', { student: student.id, tutorProfile: profile.id, admin: admin.id });
}

main().catch((error) => {
  console.error('Demo seed failed:', error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
