import { cookies } from 'next/headers';
import PricingClient from './pricing-client';

export default function PricingPage() {
  // Read the cookie securely set by our Edge Middleware!
  const cookieStore = cookies();
  const country = cookieStore.get('user-country')?.value || 'US';

  return <PricingClient countryCode={country} />;
}