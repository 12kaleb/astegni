const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const email = args.find((arg) => !arg.startsWith('--'));

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('This bootstrap script cannot run in production.');
  }

  if (!args.includes('--confirm-dev')) {
    throw new Error('Pass --confirm-dev to confirm this is a development database.');
  }

  if (!email) {
    throw new Error('Pass the email of the existing test account.');
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true },
  });

  if (!user) {
    throw new Error('No app profile found. Sign in with this account first.');
  }

  const admin = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
    select: { email: true, role: true },
  });

  console.log(`Bootstrapped ${admin.email} as ${admin.role}.`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());