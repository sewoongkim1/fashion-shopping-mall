import bcrypt from 'bcrypt';
import prisma from '../src/lib/prisma';

async function main() {
  const hashed = await bcrypt.hash('12345678', 10);
  const result = await prisma.user.updateMany({ data: { password: hashed } });
  console.log(`Updated ${result.count} users`);
  await prisma.$disconnect();
}

main();
