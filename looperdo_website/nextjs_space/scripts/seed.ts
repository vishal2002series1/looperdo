import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed a test user that matches our CURRENT schema
  const password = await bcrypt.hash('johndoe123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: { 
      password, 
      name: 'John Doe' 
    },
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      password, // 🚀 FIX: Using the correct 'password' field
      subscriptionTier: 'PRO',
      unlockedExams: ['AWS Solutions Architect Associate'],
      testsGenerated: 0,
      modulesGenerated: 0,
    },
  });

  // Seed a test attempt that matches our CURRENT schema
  await prisma.testAttempt.create({
    data: {
      userId: testUser.id,
      certification: 'AWS Solutions Architect Associate',
      score: 8.5,
      readinessPercentage: 85.0,
      weakTopics: ['VPC & Networking', 'IAM Security'],
    }
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });