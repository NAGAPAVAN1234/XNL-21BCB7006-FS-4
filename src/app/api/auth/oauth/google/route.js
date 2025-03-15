import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyGoogleToken, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { token } = await request.json();

    const googleUser = await verifyGoogleToken(token);
    
    let user = await User.findOne({ email: googleUser.email });
    
    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        password: crypto.randomBytes(32).toString('hex'),
        role: 'client',
        avatar: googleUser.picture
      });
    }

    const jwtToken = generateToken(user);
    
    return NextResponse.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
