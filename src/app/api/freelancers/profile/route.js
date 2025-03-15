import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    const db = mongoose.connection.db;
    
    const freelancer = await db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(decoded.userId) },
      {
        projection: {
          name: 1,
          avatar: 1,
          role: 1,
          category: 1, // Add category to projection
          bio: 1,
          skills: 1,
          hourlyRate: 1,
          portfolio: 1,
          languages: 1,
          education: 1,
          experience: 1,
          packages: 1,
          socialLinks: 1,
          availability: 1
        }
      }
    );

    if (!freelancer) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(freelancer);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate category
    if (data.category && !['web', 'mobile', 'design', 'writing', 'marketing', 'video', 'music', 'data'].includes(data.category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    await connectDB();
    const db = mongoose.connection.db;

    // Sanitize and format the data
    const updateData = {
      ...data,
      rating: Number(data.rating || 0),
      hourlyRate: Number(data.hourlyRate || 0),
      totalProjects: Number(data.totalProjects || 0),
      memberSince: data.memberSince ? new Date(data.memberSince) : new Date(),
      category: data.category || '', // Ensure category is included in update
      portfolio: data.portfolio?.map(item => ({
        ...item,
        image: item.image || '/images/placeholder-project.jpg'
      })),
      reviews: data.reviews?.map(review => ({
        ...review,
        rating: Number(review.rating),
        date: new Date(review.date)
      }))
    };

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(decoded.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
