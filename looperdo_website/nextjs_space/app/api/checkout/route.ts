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
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await req.json();
    if (tier !== 'PRO' && tier !== 'ALL_ACCESS') {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Removed the 'await' because Next.js 14 expects synchronous cookies()
    const cookieStore = cookies();
    const country = cookieStore.get('user-country')?.value || 'US';
    const productId = country === 'IN'
      ? PRODUCT_MAP[tier as Tier].IN
      : PRODUCT_MAP[tier as Tier].DEFAULT;

    // 🚀 CRITICAL FIX: Strip the invisible Hostinger newlines!
    const cleanApiKey = (process.env.DODO_PAYMENTS_API_KEY || '').replace(/[\r\n\s]+/g, '');

    const dodoResponse = await fetch(`${DODO_BASE}/checkouts`, { // Or /checkout_sessions if /checkouts fails
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: {
          email: session.user.email,
          name: session.user.name || 'Student'
        },
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://looperdo.com'}/dashboard?payment=success`,
      })
    });

    const paymentData = await dodoResponse.json();

    if (!dodoResponse.ok) {
      console.error("Dodo API Error details:", paymentData);
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    // Safely look for either checkout_url or payment_link
    return NextResponse.json({ checkoutUrl: paymentData.checkout_url || paymentData.payment_link });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}