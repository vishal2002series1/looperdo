import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { cookies } from 'next/headers';

const PRODUCT_MAP = {
  PRO: {
    IN: 'pdt_0NdXRHYRQhQjJBcwU9icV',
    DEFAULT: 'pdt_0NdXPDnMmEjkg3it73tVA'
  },
  ALL_ACCESS: {
    IN: 'pdt_0NdXRTlX6sFDuaC7vB5Ag',
    DEFAULT: 'pdt_0NdXPLcCzW8WAuP6GD1w1'
  }
} as const;

type Tier = keyof typeof PRODUCT_MAP;

const DODO_BASE = process.env.DODO_API_BASE || 'https://test.dodopayments.com';

export async function POST(req: Request) {
  console.log('=== ROUTE VERSION 2026-04-27-A ===');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await req.json();
    if (tier !== 'PRO' && tier !== 'ALL_ACCESS') {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const cookieStore = cookies();
    const country = cookieStore.get('user-country')?.value || 'US';

    const productId = country === 'IN'
      ? PRODUCT_MAP[tier as Tier].IN
      : PRODUCT_MAP[tier as Tier].DEFAULT;

    const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
    if (!apiKey) {
      console.error('DODO_PAYMENTS_API_KEY is not set');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://looperdo.com';

    const userEmail = session.user.email;
    const userName = session.user.name || 'Student';

    const requestUrl = `${DODO_BASE}/checkouts`;

    console.log('Dodo request:', {
      url: requestUrl,
      productId,
      tier,
      country,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey.length,
    });

    const dodoResponse = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: {
          email: userEmail,
          name: userName
        },
        return_url: `${appUrl}/dashboard?payment=success`,
      })
    });

    const paymentData = await dodoResponse.json();

    if (!dodoResponse.ok) {
      console.error('Dodo API Error details:', paymentData);
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }

    return NextResponse.json({
      checkoutUrl: paymentData.checkout_url || paymentData.payment_link
    });

  } catch (error) {
    console.error('Checkout Error:', error);
    if (error instanceof Error && 'cause' in error) {
      console.error('Error cause:', error.cause);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}