import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { availabilitySchema, validationMessage } from '../../../../lib/validation';
import { lockBookingParticipants } from '../../../../lib/bookings';

function toMinute(value) { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute; }
function toTime(value) { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }

export async function GET() {
  const tutor = await requireUser('TUTOR');
  if (!tutor) return NextResponse.json({ error: 'Tutor access required.' }, { status: 403 });
  const [profile, slots] = await Promise.all([
    prisma.user.findUnique({ where: { id: tutor.id }, select: { timeZone: true } }),
    prisma.availability.findMany({ where: { tutorId: tutor.id }, orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }] }),
  ]);
  return NextResponse.json({ timeZone: profile.timeZone, slots: slots.map((slot) => ({ weekday: slot.weekday, startTime: toTime(slot.startMinute), endTime: toTime(slot.endMinute) })) });
}

export async function PUT(request) {
  const tutor = await requireUser('TUTOR');
  if (!tutor) return NextResponse.json({ error: 'Tutor access required.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const validation = availabilitySchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
  try {
    await prisma.$transaction(async (tx) => {
      await lockBookingParticipants(tx, [tutor.id]);
      await tx.user.update({ where: { id: tutor.id }, data: { timeZone: validation.data.timeZone } });
      await tx.availability.deleteMany({ where: { tutorId: tutor.id } });
      if (validation.data.slots.length) {
        const now = new Date();
        await tx.availability.createMany({ data: validation.data.slots.map((slot) => ({ tutorId: tutor.id, weekday: slot.weekday, startMinute: toMinute(slot.startTime), endMinute: toMinute(slot.endTime), updatedAt: now })) });
      }
    });
    return NextResponse.json({ saved: true, timeZone: validation.data.timeZone });
  } catch (error) {
    console.error('Tutor availability update failed:', error);
    return NextResponse.json({ error: 'Unable to save availability.' }, { status: 500 });
  }
}
