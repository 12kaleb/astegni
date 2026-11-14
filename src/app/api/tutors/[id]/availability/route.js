import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

function time(value) { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }

export async function GET(_request, context) {
  const { id } = await context.params;
  const tutor = await prisma.tutorProfile.findFirst({
    where: { id, isVerified: true, openForStudents: true },
    select: { userId: true, user: { select: { timeZone: true } } },
  });
  if (!tutor) return NextResponse.json({ error: 'Tutor not found.' }, { status: 404 });
  const slots = await prisma.availability.findMany({ where: { tutorId: tutor.userId }, orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }], select: { weekday: true, startMinute: true, endMinute: true } });
  return NextResponse.json({ timeZone: tutor.user.timeZone, slots: slots.map((slot) => ({ weekday: slot.weekday, startTime: time(slot.startMinute), endTime: time(slot.endMinute) })) });
}
