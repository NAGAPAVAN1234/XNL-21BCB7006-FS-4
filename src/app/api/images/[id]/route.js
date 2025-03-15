import { NextResponse } from 'next/server';
import connectDB, { bucket } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    const id = new ObjectId(params.id);
    const downloadStream = bucket.openDownloadStream(id);
    const chunks = [];

    return new Promise((resolve, reject) => {
      downloadStream.on('data', chunk => chunks.push(chunk));
      downloadStream.on('error', error => {
        console.error('Download error:', error);
        resolve(NextResponse.json({ error: 'Failed to load image' }, { status: 500 }));
      });
      downloadStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
            'Access-Control-Allow-Origin': '*'
          }
        }));
      });
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
