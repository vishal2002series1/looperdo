import { NextAuthOptions, DefaultSession, DefaultUser } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';

// 🚀 1. This block extends NextAuth types to recognize our custom database fields!
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      subscriptionTier?: string;
      countryCode?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    password?: string | null;
    subscriptionTier?: string;
    countryCode?: string;
  }
}

export const authOptions: NextAuthOptions = {
  // 2. Connect NextAuth to our Neon Database
  adapter: PrismaAdapter(prisma) as any,
  
  // 3. Register our Providers (Google AND Email/Password)
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      }
    })
  ],
  
  // 4. Security Strategy
  session: { strategy: 'jwt' },
  
  // 5. Custom Login Page Routing
  pages: {
    signIn: '/login', 
  },
  
  // 6. Token & Session Management
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
          where: { id: token.id as string },
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