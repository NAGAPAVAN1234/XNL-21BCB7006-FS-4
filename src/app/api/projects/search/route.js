import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET(request) {
  try {
    await connectDB();

    const { search, category, budget } = request.nextUrl.searchParams;

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (budget && budget !== 'all') {
      if (budget === 'low') {
        query.budget = { $lt: 100 };
      } else if (budget === 'medium') {
        query.budget = { $gte: 100, $lt: 500 };
      } else if (budget === 'high') {
        query.budget = { $gte: 500 };
      }
    }

    const projects = await Project.find(query);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
