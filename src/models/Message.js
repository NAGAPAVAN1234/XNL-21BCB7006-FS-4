import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'file', 'task'], required: true },
  createdAt: { type: Date, default: Date.now },
  fileInfo: {
    name: String,
    size: Number,
    type: String
  }
});

// Add compound index for projectId and createdAt
messageSchema.index({ projectId: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
