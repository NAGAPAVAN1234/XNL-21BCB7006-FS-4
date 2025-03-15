import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();

    // Get token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify token and get user ID
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Find all projects that have proposals from this freelancer
    const projects = await Project.find({
      'proposals.freelancerId': decoded.id
    }).populate('proposals.freelancer', 'name');

    // Extract and format proposals
    const proposals = projects.flatMap(project => 
      project.proposals
        .filter(prop => prop.freelancerId.toString() === decoded.id)
        .map(prop => ({
          _id: prop._id,
          projectId: project._id,
          projectTitle: project.title,
          bidAmount: prop.bidAmount,
          deliveryTime: prop.deliveryTime,
          status: prop.status,
          coverLetter: prop.coverLetter,
          createdAt: prop.createdAt
        }))
    );

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Error fetching freelancer proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}
