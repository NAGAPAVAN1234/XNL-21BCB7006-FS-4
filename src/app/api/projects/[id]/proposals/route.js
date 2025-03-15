import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    await connectDB();

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid project ID format' },
        { status: 400 }
      );
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const data = await request.json();
    const project = await Project.findById(params.id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user has already submitted a proposal
    const existingProposal = project.proposals.find(
      p => p.freelancer.toString() === decoded.id
    );

    if (existingProposal) {
      return NextResponse.json(
        { error: 'You have already submitted a proposal for this project' },
        { status: 400 }
      );
    }

    // Add the proposal
    project.proposals.push({
      freelancer: decoded.id,
      coverLetter: data.coverLetter,
      bidAmount: data.bidAmount,
      deliveryTime: data.deliveryTime
    });

    await project.save();
    
    return NextResponse.json({
      message: 'Proposal submitted successfully',
      proposalId: project.proposals[project.proposals.length - 1]._id
    });

  } catch (error) {
    console.error('Proposal submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit proposal' },
      { status: 500 }
    );
  }
}
