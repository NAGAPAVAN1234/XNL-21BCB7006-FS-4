import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { status } = await request.json();
    const { id, proposalId } = params;

    const project = await Project.findOneAndUpdate(
      { 
        _id: id,
        'proposals._id': proposalId 
      },
      { 
        $set: { 'proposals.$.status': status }
      },
      { new: true }
    );

    if (!project) {
      return NextResponse.json(
        { error: 'Project or proposal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Proposal updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
