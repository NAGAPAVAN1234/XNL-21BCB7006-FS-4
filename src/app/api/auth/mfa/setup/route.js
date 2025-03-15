import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateMFASecret } from '@/lib/auth';
import { authenticator } from 'otplib';

export async function POST(request) {
  try {
    await connectDB();
    const { userId } = await request.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const secret = generateMFASecret();
    const otpauth = authenticator.keyuri(user.email, 'FreelanceHub', secret);

    user.mfaSecret = secret;
    await user.save();

    return NextResponse.json({ 
      secret,
      otpauth
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
