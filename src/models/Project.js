import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  uploadedAt: { type: Date, default: Date.now }
});

fileSchema.index({ uploadedAt: -1 });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  skills: [String],
  budget: {
    type: { type: String, enum: ['fixed', 'hourly'], required: true },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true }
  },
  duration: { type: String, required: true },
  experienceLevel: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  proposals: [{
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    coverLetter: String,
    bidAmount: Number,
    deliveryTime: Number,
    status: { 
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  files: [fileSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
