import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET(request) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const budget = searchParams.get('budget');

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (budget && budget !== 'all') {
      if (budget === 'low') {
        query['budget.minAmount'] = { $lt: 100 };
      } else if (budget === 'medium') {
        query['budget.minAmount'] = { $gte: 100, $lt: 500 };
      } else if (budget === 'high') {
        query['budget.minAmount'] = { $gte: 500 };
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
