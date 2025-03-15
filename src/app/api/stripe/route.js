import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyAuth } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { packageDetails, freelancerId } = await request.json();

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: packageDetails.name,
            description: `${packageDetails.name} - ${packageDetails.deliveryTime} delivery`,
            images: [process.env.NEXT_PUBLIC_URL + '/package-icon.png']
          },
          unit_amount: packageDetails.price * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/freelancer/${freelancerId}`,
      metadata: {
        freelancerId,
        clientId: decoded.id,
        packageName: packageDetails.name
      },
      payment_intent_data: {
        metadata: {
          freelancerId,
          clientId: decoded.id,
          packageName: packageDetails.name
        }
      }
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
