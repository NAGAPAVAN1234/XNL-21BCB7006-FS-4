import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      ...(data.role === 'freelancer' && {
        hourlyRate: data.hourlyRate,
        skills: data.skills,
        bio: data.bio
      })
    });

    // Generate token
    const token = generateToken(newUser);

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json({
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
