import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

const defaultPackages = [
  {
    name: "Basic Package",
    price: 499,
    deliveryTime: "5 days",
    features: [
      "Single page application",
      "Responsive design",
      "2 revisions",
      "Source code included"
    ]
  },
  {
    name: "Standard Package",
    price: 999,
    deliveryTime: "10 days",
    features: [
      "Up to 5 pages",
      "Responsive design",
      "5 revisions",
      "Source code included",
      "Database integration"
    ]
  },
  {
    name: "Premium Package",
    price: 1999,
    deliveryTime: "15 days",
    features: [
      "Full website development",
      "Responsive design",
      "Unlimited revisions",
      "Source code included",
      "Database integration",
      "API development",
      "3 months support"
    ]
  }
];

export async function GET(request, { params }) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const freelancer = await db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(params.id) }
    );

    if (!freelancer) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Format the data with default values and packages
    const formattedFreelancer = {
      ...freelancer,
      rating: Number(freelancer.rating || 0).toFixed(1),
      hourlyRate: Number(freelancer.hourlyRate || 0),
      totalProjects: Number(freelancer.totalProjects || 0),
      totalReviews: freelancer.reviews?.length || 0,
      successRate: freelancer.successRate || '0%',
      onTimeDelivery: freelancer.onTimeDelivery || '0%',
      skills: freelancer.skills || [],
      portfolio: (freelancer.portfolio || []).map(item => ({
        ...item,
        image: item.image || '/images/placeholder-project.jpg'
      })),
      reviews: (freelancer.reviews || []).map(review => ({
        ...review,
        rating: Number(review.rating || 0),
        date: review.date ? new Date(review.date).toISOString() : new Date().toISOString()
      })),
      packages: freelancer.packages?.length > 0 ? freelancer.packages : defaultPackages,
      languages: freelancer.languages || [],
      socialLinks: {
        website: freelancer.socialLinks?.website || '',
        linkedin: freelancer.socialLinks?.linkedin || '',
        github: freelancer.socialLinks?.github || '',
        twitter: freelancer.socialLinks?.twitter || ''
      }
    };

    return NextResponse.json(formattedFreelancer);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch freelancer' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();
    const db = mongoose.connection.db;

    // Validate review data
    if (!data.rating || !data.comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const review = {
      clientId: session.user.id,
      clientName: session.user.name,
      rating: data.rating,
      comment: data.comment,
      date: new Date(),
    };

    // Add review and update average rating
    const result = await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(params.id) },
      { 
        $push: { reviews: review },
        $inc: { totalReviews: 1 }
      }
    );

    // ...existing error handling...
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to add review' },
      { status: 500 }
    );
  }
}
