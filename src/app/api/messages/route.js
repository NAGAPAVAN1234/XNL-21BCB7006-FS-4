import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { projectId, content, type } = await request.json();
    const authHeader = request.headers.get('authorization');
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const message = await Message.create({
      projectId,
      sender: decoded.id,
      content,
      type
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
