import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // Check if the event is a successful payment
        if (payload.type === 'payment.succeeded') {
            const customerEmail = payload.data.customer.email;
            
            // Upgrade the user in your Neon database!
            await prisma.user.update({
                where: { email: customerEmail },
                data: { subscriptionTier: 'PRO' } 
            });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Dodo Webhook Error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}