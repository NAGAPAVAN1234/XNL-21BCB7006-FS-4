import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await connectDB();
    
    // Extract projectId from URL properly
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const projectId = pathSegments[pathSegments.length - 1];

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const messages = await Message.find({ projectId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
