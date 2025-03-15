import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');
    
    let query = {};
    if (category) query.category = category;
    if (userId) query.client = userId;
    
    const projects = await Project.find(query)
      .populate('client', 'name rating')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

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

    // Get the data and add verified user as client
    const data = await request.json();
    data.client = decoded.id;

    const project = await Project.create(data);
    return NextResponse.json(project);

  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: error.status || 500 }
    );
  }
}
