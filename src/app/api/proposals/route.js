import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    const db = mongoose.connection.db;

    const { searchParams } = new URL(request.url);
    const freelancerId = searchParams.get('freelancerId');

    // Find all projects with proposals by this freelancer
    const projects = await db.collection('projects')
      .find({
        'proposals.freelancer': new mongoose.Types.ObjectId(freelancerId)
      })
      .toArray();

    // Extract and format proposals
    const proposals = projects.flatMap(project => 
      project.proposals
        .filter(p => p.freelancer.toString() === freelancerId)
        .map(p => ({
          ...p,
          projectId: project._id,
          projectTitle: project.title,
          status: p.status,
          bidAmount: p.bidAmount,
          rating: project.freelancerRating
        }))
    );

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}
