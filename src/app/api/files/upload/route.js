import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file');
    const projectId = formData.get('projectId');

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'File and project ID are required' },
        { status: 400 }
      );
    }

    // Verify auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(authHeader.split(' ')[1]);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename and ensure directory exists
    const fileName = `${uuidv4()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, fileName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    // Create file document
    const fileDoc = {
      name: file.name,
      path: `/uploads/${fileName}`,
      type: file.type,
      size: file.size,
      uploadedBy: new mongoose.Types.ObjectId(decoded.id)
    };

    // Update project with the new file
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $push: { files: fileDoc } },
      { new: true, runValidators: true }
    ).lean();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const savedFile = project.files[project.files.length - 1];

    return NextResponse.json({
      id: savedFile._id.toString(),
      name: savedFile.name,
      url: savedFile.path,
      type: savedFile.type,
      size: savedFile.size
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
