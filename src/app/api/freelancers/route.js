import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const experience = searchParams.get('experience') || 'any';

    await connectDB();
    const db = mongoose.connection.db;
    
    // Update query to get all users except clients
    let query = { role: { $ne: 'client' } }; // Changed this line
    
    if (search) {
      query.$or = [
        { skills: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    if (category !== 'all') {
      query.category = category;
    }

    if (experience !== 'any') {
      query.experienceLevel = experience;
    }

    const freelancers = await db.collection('users')
      .find(query)
      .project({
        name: 1,
        avatar: 1,
        role: 1,
        bio: 1,
        skills: 1,
        hourlyRate: 1,
        rating: 1,
        totalProjects: 1,
        successRate: 1
      })
      .toArray();

    // Format response data
    const formattedFreelancers = freelancers.map(doc => ({
      ...doc,
      rating: Number(doc.rating || 0).toFixed(1),
      totalProjects: doc.totalProjects || 0,
      successRate: doc.successRate || '0%',
      hourlyRate: Number(doc.hourlyRate || 0),
      skills: doc.skills || [],
      bio: doc.bio || 'No bio available',
      role: doc.role || 'Freelancer' // Add default role
    }));

    return NextResponse.json(formattedFreelancers);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch freelancers' },
      { status: 500 }
    );
  }
}
