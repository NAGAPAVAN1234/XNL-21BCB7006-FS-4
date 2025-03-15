import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import mongoose from 'mongoose';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { taskId } = params;
    const { status } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    ).populate('assignedTo', 'name')
      .populate('createdBy', 'name');

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
