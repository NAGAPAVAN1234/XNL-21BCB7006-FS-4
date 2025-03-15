import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    await connectDB();
    const db = mongoose.connection.db;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Create a new transaction record
        await db.collection('transactions').insertOne({
          stripeSessionId: session.id,
          amount: session.amount_total / 100,
          currency: session.currency,
          status: 'completed',
          freelancerId: session.metadata.freelancerId,
          clientId: session.metadata.clientId,
          packageName: session.metadata.packageName,
          createdAt: new Date()
        });

        // Update freelancer's stats
        await db.collection('users').updateOne(
          { _id: new mongoose.Types.ObjectId(session.metadata.freelancerId) },
          { 
            $inc: { 
              totalProjects: 1,
              earnings: session.amount_total / 100
            }
          }
        );

        break;
      }
      case 'payment_intent.payment_failed': {
        const session = event.data.object;
        
        await db.collection('transactions').insertOne({
          stripeSessionId: session.id,
          status: 'failed',
          freelancerId: session.metadata.freelancerId,
          clientId: session.metadata.clientId,
          error: session.last_payment_error?.message,
          createdAt: new Date()
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
