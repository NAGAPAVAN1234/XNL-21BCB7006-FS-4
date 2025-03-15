import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    
    const freelancer = await db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(params.id) }
    );

    if (!freelancer) {
      return NextResponse.json({ error: 'Freelancer not found' }, { status: 404 });
    }

    // Format the rating and reviews
    const formattedFreelancer = {
      ...freelancer,
      rating: Number(freelancer.rating || 0).toFixed(1),
      totalReviews: freelancer.totalReviews || 0,
      reviews: (freelancer.reviews || []).map(review => ({
        ...review,
        rating: Number(review.rating),
        createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : new Date().toISOString()
      }))
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
    // Verify authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get review data
    const reviewData = await request.json();

    // Validate review data
    if (!reviewData.rating || !reviewData.comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to database
    await connectDB();
    const db = mongoose.connection.db;

    // Check if freelancer exists
    const freelancer = await db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(params.id) }
    );

    if (!freelancer) {
      return NextResponse.json({ error: 'Freelancer not found' }, { status: 404 });
    }

    // Create review object
    const review = {
      clientId: decoded.id,
      clientName: decoded.name || 'Anonymous',
      rating: Number(reviewData.rating),
      comment: reviewData.comment,
      date: new Date(),
      verified: true
    };

    // Update freelancer with new review
    const result = await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(params.id) },
      { 
        $push: { reviews: review },
        $inc: { totalReviews: 1 }
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error('Failed to add review');
    }

    // Calculate new average rating
    const updatedFreelancer = await db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(params.id) }
    );

    const avgRating = updatedFreelancer.reviews.reduce((sum, r) => sum + r.rating, 0) / 
                     updatedFreelancer.reviews.length;

    // Update average rating
    await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(params.id) },
      { $set: { rating: Number(avgRating.toFixed(1)) } }
    );

    return NextResponse.json({ 
      message: 'Review added successfully',
      review 
    });

  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add review' },
      { status: 500 }
    );
  }
}
