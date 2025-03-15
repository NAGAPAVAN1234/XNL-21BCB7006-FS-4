import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const stats = await Project.aggregate([
      {
        $match: {
          client: decoded.id
        }
      },
      {
        $group: {
          _id: null,
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
          },
          totalEarnings: {
            $sum: '$budget.maxAmount'
          },
          totalProposals: {
            $sum: { $size: '$proposals' }
          }
        }
      }
    ]);

    return NextResponse.json(stats[0] || {
      activeProjects: 0,
      totalEarnings: 0,
      totalProposals: 0
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
