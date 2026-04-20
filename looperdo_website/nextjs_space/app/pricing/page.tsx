import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import PricingClient from './pricing-client';

export default async function PricingPage() {
  // 1. Get Country Code
  const cookieStore = cookies();
  const country = cookieStore.get('user-country')?.value || 'IN';

  // 2. Get the User's TRUE Database Tier securely on the server
  const session = await getServerSession(authOptions);
  let currentTier = 'FREE';

  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({ 
        where: { email: session.user.email } 
    });
    if (dbUser) currentTier = dbUser.subscriptionTier;
  }

  // 3. Fetch Pricing from Neon Database
  let pricing = await prisma.regionalPricing.findUnique({ 
      where: { countryCode: country } 
  });
  
  // Fallback to Rest of World (ROW) if country isn't explicitly set in DB
  if (!pricing) {
    pricing = await prisma.regionalPricing.findUnique({ 
        where: { countryCode: 'ROW' } 
    });
  }

  // Absolute fallback just in case the database table is empty during testing
  const safePricing = pricing || {
      currencySymbol: '₹',
      proPrice: '1550',
      allAccessPrice: '3900'
  };

  return (
      <PricingClient 
          countryCode={country} 
          currentTier={currentTier} 
          pricingData={{
              currencySymbol: safePricing.currencySymbol,
              proPrice: safePricing.proPrice,
              allAccessPrice: safePricing.allAccessPrice
          }} 
      />
  );
}