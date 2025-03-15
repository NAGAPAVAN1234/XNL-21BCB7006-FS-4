import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const data = await request.json();
    const task = await Task.create({
      ...data,
      createdBy: decoded.id
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
