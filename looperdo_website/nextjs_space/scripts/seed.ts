import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed test user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: { hashedPassword, name: 'John Doe', role: 'admin' },
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      hashedPassword,
      role: 'admin',
    },
  });

  // Seed student profile
  const profile = await prisma.studentProfile.upsert({
    where: { userId: testUser.id },
    update: {
      readinessScore: 72,
      totalTestsTaken: 24,
      totalStudyHours: 48.5,
      currentStreak: 7,
      longestStreak: 14,
    },
    create: {
      userId: testUser.id,
      readinessScore: 72,
      totalTestsTaken: 24,
      totalStudyHours: 48.5,
      currentStreak: 7,
      longestStreak: 14,
    },
  });

  // Seed certification progress
  await prisma.certificationProgress.upsert({
    where: { profileId_certificationSlug: { profileId: profile.id, certificationSlug: 'aws-saa' } },
    update: {
      readinessScore: 78,
      testsCompleted: 16,
      topicScores: {
        'Design Secure Architectures': 85,
        'Design Resilient Architectures': 72,
        'Design High-Performing Architectures': 68,
        'Design Cost-Optimized Architectures': 80,
        'VPC & Networking': 62,
        'IAM & Security': 90,
        'S3 & Storage Solutions': 75,
        'EC2 & Compute': 82,
        'RDS & DynamoDB': 58,
        'CloudFront & Route 53': 70,
      },
    },
    create: {
      profileId: profile.id,
      certificationSlug: 'aws-saa',
      certificationName: 'AWS Solutions Architect Associate',
      readinessScore: 78,
      testsCompleted: 16,
      topicScores: {
        'Design Secure Architectures': 85,
        'Design Resilient Architectures': 72,
        'Design High-Performing Architectures': 68,
        'Design Cost-Optimized Architectures': 80,
        'VPC & Networking': 62,
        'IAM & Security': 90,
        'S3 & Storage Solutions': 75,
        'EC2 & Compute': 82,
        'RDS & DynamoDB': 58,
        'CloudFront & Route 53': 70,
      },
    },
  });

  await prisma.certificationProgress.upsert({
    where: { profileId_certificationSlug: { profileId: profile.id, certificationSlug: 'lean-six-sigma' } },
    update: {
      readinessScore: 45,
      testsCompleted: 8,
      topicScores: {
        'Define Phase': 65,
        'Measure Phase': 52,
        'Analyze Phase': 40,
        'Improve Phase': 35,
        'Control Phase': 30,
        'Statistical Process Control': 48,
        'Hypothesis Testing': 42,
        'Regression Analysis': 38,
      },
    },
    create: {
      profileId: profile.id,
      certificationSlug: 'lean-six-sigma',
      certificationName: 'Lean Six Sigma Black Belt',
      readinessScore: 45,
      testsCompleted: 8,
      topicScores: {
        'Define Phase': 65,
        'Measure Phase': 52,
        'Analyze Phase': 40,
        'Improve Phase': 35,
        'Control Phase': 30,
        'Statistical Process Control': 48,
        'Hypothesis Testing': 42,
        'Regression Analysis': 38,
      },
    },
  });

  // Seed test history
  const testHistories = [
    { certificationSlug: 'aws-saa', score: 82, totalQuestions: 20, correctAnswers: 16, difficulty: 'hard', completedAt: new Date('2026-03-24T14:30:00Z') },
    { certificationSlug: 'aws-saa', score: 75, totalQuestions: 20, correctAnswers: 15, difficulty: 'medium', completedAt: new Date('2026-03-22T10:15:00Z') },
    { certificationSlug: 'lean-six-sigma', score: 60, totalQuestions: 15, correctAnswers: 9, difficulty: 'medium', completedAt: new Date('2026-03-21T16:45:00Z') },
    { certificationSlug: 'aws-saa', score: 70, totalQuestions: 20, correctAnswers: 14, difficulty: 'medium', completedAt: new Date('2026-03-20T09:00:00Z') },
    { certificationSlug: 'aws-saa', score: 65, totalQuestions: 20, correctAnswers: 13, difficulty: 'easy', completedAt: new Date('2026-03-18T11:30:00Z') },
    { certificationSlug: 'lean-six-sigma', score: 53, totalQuestions: 15, correctAnswers: 8, difficulty: 'easy', completedAt: new Date('2026-03-17T15:00:00Z') },
  ];

  // Check existing test history count
  const existingCount = await prisma.testHistory.count({ where: { profileId: profile.id } });
  if (existingCount === 0) {
    for (const th of testHistories) {
      await prisma.testHistory.create({
        data: {
          profileId: profile.id,
          ...th,
        },
      });
    }
  }

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
