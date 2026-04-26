import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { cookies } from 'next/headers';

// 🚀 PASTE YOUR 4 DODO PRODUCT IDs HERE
const PRODUCT_MAP = {
  PRO: {
    IN: 'pdt_0NdXRHYRQhQjJBcwU9icV', 
    DEFAULT: 'pdt_0NdXPDnMmEjkg3it73tVA' // Used for US and ROW
  },
  ALL_ACCESS: {
    IN: 'pdt_0NdXRTlX6sFDuaC7vB5Ag',
    DEFAULT: 'pdt_0NdXPLcCzW8WAuP6GD1w1' // Used for US and ROW
  }
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await req.json();
    
    // Read the country cookie
    const cookieStore = cookies();
    const country = cookieStore.get('user-country')?.value || 'US';

    // The ROW Routing Logic: If India, use IN product. Otherwise, use DEFAULT.
    const isIndia = country === 'IN';
    const productId = isIndia 
        ? PRODUCT_MAP[tier as keyof typeof PRODUCT_MAP].IN 
        : PRODUCT_MAP[tier as keyof typeof PRODUCT_MAP].DEFAULT;

    // Create the Checkout Session with Dodo Payments
    const dodoResponse = await fetch('https://api.dodopayments.com/v1/payments', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: 1,
            customer: {
                email: session.user.email,
                name: session.user.name || 'Student'
            },
            // Where to send them after they pay successfully
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
        })
    });

    const paymentData = await dodoResponse.json();

    if (!dodoResponse.ok) {
        console.error("Dodo API Error:", paymentData);
        return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    // Send the secure checkout link back to the frontend
    return NextResponse.json({ checkoutUrl: paymentData.payment_link });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}