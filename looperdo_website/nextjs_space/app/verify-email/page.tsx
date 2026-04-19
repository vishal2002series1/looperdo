import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

const prisma = new PrismaClient();

export default async function VerifyEmailPage({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token;

  if (!token) {
    return <ResultCard error="Missing verification token." />;
  }

  // 1. Find the token
  const existingToken = await prisma.verificationToken.findUnique({
    where: { token }
  });

  if (!existingToken) {
    return <ResultCard error="Token does not exist or has already been used." />;
  }

  // 2. Check if expired
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return <ResultCard error="This verification link has expired. Please sign up again." />;
  }

  // 3. Find the user and verify their email
  const existingUser = await prisma.user.findUnique({
    where: { email: existingToken.email }
  });

  if (!existingUser) {
    return <ResultCard error="Email does not exist." />;
  }

  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email, // Edge case for email changes
    }
  });

  // 4. Delete the token so it can't be used again
  await prisma.verificationToken.delete({
    where: { id: existingToken.id }
  });

  return (
    <ResultCard success="Your email has been successfully verified! You can now log in." />
  );
}

// Simple UI Card for the result
function ResultCard({ success, error }: { success?: string; error?: string }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full text-center">
        {success ? (
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        )}
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">
          {success ? "Email Verified" : "Verification Failed"}
        </h1>
        <p className="text-gray-600 mb-6">{success || error}</p>
        <Link href="/login" className="inline-block bg-[#2563eb] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors">
          Go to Login
        </Link>
      </div>
    </div>
  );
}