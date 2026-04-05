import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  // 1. Connect NextAuth to our Neon Database
  adapter: PrismaAdapter(prisma) as any,
  
  // 2. Register Google as the ONLY provider
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  
  // 3. Security Strategy
  session: { strategy: 'jwt' },
  
  // 4. Custom Login Page Routing
  pages: {
    signIn: '/login', 
  },
  
  // 5. Token & Session Management
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        (session.user as any).id = token.id;
        
        // Fetch our custom business fields from the database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { subscriptionTier: true, countryCode: true }
        });

        // Attach them to the active session
        if (dbUser) {
          (session.user as any).subscriptionTier = dbUser.subscriptionTier;
          (session.user as any).countryCode = dbUser.countryCode;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};