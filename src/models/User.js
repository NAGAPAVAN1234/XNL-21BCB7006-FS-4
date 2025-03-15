import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['freelancer', 'client'], required: true },
  category: { type: String },
  skills: [String],
  hourlyRate: { type: Number, default: 0 },
  bio: String,
  avatar: { type: String, default: '/user.avif' },
  rating: { 
    type: Number, 
    default: 0,
    get: v => Number(v || 0).toFixed(1),
    set: v => Number(v || 0)
  },
  totalReviews: { 
    type: Number, 
    default: 0,
    min: 0
  },
  reviews: [{
    clientId: mongoose.Schema.Types.ObjectId,
    clientName: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      set: v => Number(v)
    },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  completedProjects: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: String,
  portfolio: [{
    title: { type: String, required: true },
    description: String,
    projectUrl: { type: String, required: true }, // Make projectUrl required instead of image
    technologies: [String],
    image: { type: String, default: '/images/default-project.jpg' }, // Add default image
    completionDate: Date
  }],
  packages: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    deliveryTime: { type: String, required: true },
    features: [String],
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    from: Date,
    to: Date
  }],
  experience: [{
    company: String,
    position: String,
    description: String,
    from: Date,
    to: Date
  }],
  languages: [{
    name: String,
    proficiency: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'] }
  }],
  socialLinks: {
    website: String,
    linkedin: String,
    github: String,
    twitter: String
  },
  availability: {
    status: { type: String, enum: ['available', 'partially-available', 'not-available'] },
    hoursPerWeek: Number
  },
  totalProjects: { type: Number, default: 0 },
  successRate: { type: String, default: '0%' },
  onTimeDelivery: { type: String, default: '0%' },
  location: String,
  memberSince: { type: Date, default: Date.now },
  languages: [String],
  bio: String,
  skills: [String],
  portfolio: [{
    title: { type: String, required: true },
    description: String,
    image: { type: String, default: '/images/default-project.jpg' },
    link: String,
    createdAt: { type: Date, default: Date.now }
  }],
  reviews: [{
    name: String,
    role: String,
    avatar: { type: String, default: '/user.avif' },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5 
    },
    date: { type: Date, default: Date.now },
    comment: String
  }],
  packages: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    deliveryTime: { type: String, required: true },
    features: [String]
  }]
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Update rating calculation middleware
userSchema.pre('save', function(next) {
  if (this.reviews?.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    this.rating = Number((totalRating / this.reviews.length).toFixed(1));
    this.totalReviews = this.reviews.length;
  } else {
    this.rating = 0;
    this.totalReviews = 0;
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', userSchema);
