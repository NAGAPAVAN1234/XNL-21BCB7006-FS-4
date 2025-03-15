import { NextResponse } from 'next/server';
import connectDB, { bucket } from '@/lib/mongodb';
import { Readable } from 'stream';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    await connectDB();

    const buffer = await file.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    return new Promise((resolve) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.type,
        metadata: {
          userId: decoded.id,
          uploadedAt: new Date()
        }
      });

      stream.pipe(uploadStream)
        .on('error', (error) => {
          console.error('Upload error:', error);
          resolve(NextResponse.json({ error: 'Upload failed' }, { status: 500 }));
        })
        .on('finish', () => {
          resolve(NextResponse.json({
            url: `/api/images/${uploadStream.id}`,
            filename: filename
          }));
        });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
