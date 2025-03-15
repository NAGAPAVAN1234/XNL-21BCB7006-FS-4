import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: 'Connected to MongoDB successfully' });
  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
