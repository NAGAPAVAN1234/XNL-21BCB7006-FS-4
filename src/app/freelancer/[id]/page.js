'use client'
import { useState, use, useEffect } from 'react';
import Image from 'next/image';
import { StarIcon, CheckBadgeIcon, ChatIcon } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';
import { FiBriefcase, FiExternalLink, FiThumbsUp, FiCalendar, FiClock, FiMessageSquare, FiDollarSign, FiStar, FiCheck, FiGlobe, FiLinkedin, FiGithub, FiTwitter } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />
});

const Chat = dynamic(() => import('@/components/Chat'), {
  loading: () => <Loading />
});

// Add this utility function before the component
const validateImageUrl = (url) => {
  if (!url) return false;
  if (url.startsWith('/')) return true; // Allow local public images
  
  const allowedDomains = [
    'localhost',
    'res.cloudinary.com',
    'storage.googleapis.com',
    'your-domain.com',
    'images.unsplash.com',
    'via.placeholder.com'
  ];

  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => urlObj.hostname.includes(domain)) || url.startsWith('/api/images/');
  } catch {
    return false;
  }
};

const getImageUrl = (url) => {
  if (!url) return '/images/placeholder-project.jpg';
  if (url.startsWith('/api/images/')) {
    return url; // Remove token from URL as images are now public
  }
  return url;
};

const getPublicImageUrl = (url) => {
  if (!url) return '/images/placeholder-project.jpg';
  if (url.startsWith('/api/images/')) {
    return url; // Remove timestamp query parameter
  }
  return url;
};

const getPortfolioImage = (url) => {
  if (!url) return '/images/placeholder-project.jpg';
  if (url.startsWith('/api/images/')) {
    return url;
  }
  return validateImageUrl(url) ? url : '/images/placeholder-project.jpg';
};

const ReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Write a Review</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-8 h-8 cursor-pointer ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg p-3"
              rows={4}
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-3 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, packageDetails, onSubmit, freelancerId }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const stripe = await stripePromise;
      
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          packageDetails,
          freelancerId
        })
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({
        sessionId
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !packageDetails) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
        <div className="space-y-6">
          <div className="border rounded-xl p-6">
            <h3 className="font-bold text-xl mb-2">{packageDetails.name}</h3>
            <p className="text-2xl font-bold text-blue-600">${packageDetails.price}</p>
            <p className="text-gray-600">Delivery in {packageDetails.deliveryTime}</p>
          </div>
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-3 rounded-xl ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
          <button
            onClick={onClose}
            className="w-full border py-3 rounded-xl"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FreelancerProfile({ params }) {
  const { id } = use(params);
  const [showChat, setShowChat] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchFreelancer = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/freelancers/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {

        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch freelancer');
      }

      const data = await response.json();
      setFreelancer({
        ...data,
        // Add default values for required fields
        name: data.name || 'Freelancer',
        avatar: data.avatar || '/user.avif',
        role: 'Freelancer',
        category: data.category || 'Full Stack Developer',
        bio: data.bio || '',
        rating: Number(data.rating || 0).toFixed(1),
        totalReviews: data.totalReviews || 0,
        hourlyRate: Number(data.hourlyRate || 0),
        totalProjects: Number(data.totalProjects || 0),
        successRate: data.successRate || '0%',
        onTimeDelivery: data.onTimeDelivery || '0%',
        skills: data.skills || [],
        portfolio: data.portfolio || [],
        reviews: data.reviews || [],
        packages: data.packages || [],
        languages: data.languages || [],
        socialLinks: data.socialLinks || {
          website: '',
          linkedin: '',
          github: '',
          twitter: ''
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancer();
  }, [id]);

  const handleAddReview = async (reviewData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/freelancers/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: Number(reviewData.rating),
          comment: reviewData.comment,
          date: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add review');
      }

      // Only close modal and refresh if successful
      await fetchFreelancer();
      setShowReviewModal(false);
    } catch (error) {
      console.error('Error adding review:', error);
      alert(error.message || 'Failed to add review. Please try again.');
    }
  };

  const handlePayment = async (packageDetails) => {
    try {
      setLoading(true);
      const stripe = await stripePromise;
      
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          packageDetails,
          freelancerId: id
        })
      });
  
      const { sessionId } = await response.json();
      
      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({
        sessionId
      });
  
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const LoadingState = () => (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="pt-24">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-8">
                <div className="w-40 h-40 bg-gray-200 rounded-2xl"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            {/* Add more skeleton loaders for other sections */}
          </div>
        </div>
      </div>
    </div>
  );

  const ErrorState = ({ message }) => (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{message}</p>
            <Link href="/hire" className="text-blue-600 hover:underline mt-4 inline-block">
              ← Back to Freelancers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Profile Not Found</h2>
            <p className="text-yellow-700">This freelancer profile has not been created or has been removed.</p>
            <Link href="/hire" className="text-blue-600 hover:underline mt-4 inline-block">
              ← Back to Freelancers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!freelancer) return <EmptyState />;

  // Provide default values for potentially undefined properties
  const {
    name = 'Freelancer',
    avatar = '/user.avif',
    role = 'Freelancer',
    rating = 0,
    totalReviews = 0,
    hourlyRate = 0,
    totalProjects = 0,
    successRate = '0%',
    onTimeDelivery = '0%',
    skills = [],
    portfolio = [],
    reviews = [],
    packages = [],
    languages = [],
    socialLinks = {
      website: '',
      linkedin: '',
      github: '',
      twitter: ''
    }
  } = freelancer || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center text-white">
            <div className="relative w-40 h-40"> {/* Add dimensions and relative positioning */}
              <Image
                src={freelancer?.avatar || '/user.avif'}  
                alt={`${freelancer?.name || 'Freelancer'}'s profile picture`} // Add descriptive alt text
                fill
                className="rounded-2xl object-cover border-4 border-white/20"
                priority
              />
              <span className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-xl">
                <CheckBadgeIcon className="w-6 h-6 text-white" />
              </span>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{freelancer?.name}</h1>
              <p className="text-lg text-white/80 mb-4">{freelancer?.role}</p>
              <p className="text-lg text-white/80 mb-4">{freelancer?.category||'Full Stack Developer'}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                  <span className="font-semibold">{freelancer?.rating}</span>
                  <span className="text-white/60">({freelancer?.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiBriefcase className="w-6 h-6" />
                  <span>{freelancer?.totalProjects} Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-6 h-6" />
                  <span>{freelancer?.successRate} Success</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">About Me</h2>
              <p className="text-gray-600 whitespace-pre-line">{freelancer?.bio}</p>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {(freelancer?.skills || []).map((skill, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl
                             hover:bg-blue-100 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {languages.map((language, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl
                              hover:bg-purple-100 transition-colors"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Connect</h2>
              <div className="space-y-4">
                {Object.entries(socialLinks).map(([platform, url]) => url && (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-blue-600"
                  >
                    {platform === 'website' && <FiGlobe className="w-5 h-5" />}
                    {platform === 'linkedin' && <FiLinkedin className="w-5 h-5" />}
                    {platform === 'github' && <FiGithub className="w-5 h-5" />}
                    {platform === 'twitter' && <FiTwitter className="w-5 h-5" />}
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </a>
                ))}
              </div>
            </div>

            {/* Portfolio Section */}
            {freelancer?.portfolio?.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
                <div className="grid grid-cols-2 gap-6">
                  {freelancer.portfolio.map((item, index) => (
                    <div key={index} className="group relative rounded-xl overflow-hidden">
                      <div className="aspect-w-16 aspect-h-9 relative"> {/* Add relative positioning */}
                        <Image
                          src={'/images/placeholder-project.jpg'}
                          alt={`${item.title} || 'Portfolio project`} // Add descriptive alt text
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                          <p className="text-white/80 text-sm mb-3 line-clamp-2">{item.description}</p>
                          {item.projectUrl && (
                            <a 
                              href={item.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-400 hover:text-blue-300"
                            >
                              View Project <FiExternalLink className="ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {freelancer?.reviews?.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Client Reviews</h2>
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-6 h-6 text-yellow-400" />
                    <span className="font-bold text-xl">{freelancer.rating}</span>
                    <span className="text-gray-600">({freelancer.reviews.length} reviews)</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {freelancer.reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="relative w-12 h-12"> {/* Add dimensions and relative positioning */}
                          <Image
                            src={review.avatar || '/user.avif'}
                            alt={`${review.name}'s profile picture`} // Add descriptive alt text
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">{review.name}</h3>
                              <p className="text-gray-600 text-sm">{review.role}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <StarIcon className="w-5 h-5 text-yellow-400" />
                              <span className="font-bold">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 mt-2">{review.comment}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <FiCalendar className="w-4 h-4" />
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiThumbsUp className="w-4 h-4" />
                              Verified Review
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Review Stats */}
                <div className="grid grid-cols-2 gap-4 mt-8 bg-gray-50 p-6 rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{freelancer.successRate}</p>
                    <p className="text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{freelancer.onTimeDelivery}</p>
                    <p className="text-gray-600">On-Time Delivery</p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Packages Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-6">Service Packages</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {(freelancer?.packages || []).map((pkg, index) => (
                  <div key={index} className="border rounded-xl p-6 hover:shadow-lg transition-all">
                    <h3 className="font-bold text-xl mb-2">{pkg.name}</h3>
                    <p className="text-3xl font-bold text-blue-600 mb-4">${pkg.price}</p>
                    <p className="text-gray-600 mb-4">Delivery in {pkg.deliveryTime}</p>
                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-700">
                          <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowPaymentModal(true);
                      }}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                      Select Package
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-blue-600">${freelancer?.hourlyRate}/hr</p>
                <p className="text-gray-600">Starting Rate</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900">{freelancer?.totalProjects}</p>
                  <p className="text-gray-600 text-sm">Projects</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900">{freelancer?.onTimeDelivery}</p>
                  <p className="text-gray-600 text-sm">On Time</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowChat(true)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700
                           flex items-center justify-center gap-2"
                >
                  <FiMessageSquare className="w-5 h-5" />
                  Message
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700
                           flex items-center justify-center gap-2"
                >
                  <FiDollarSign className="w-5 h-5" />
                  Select Package
                </button>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full py-3 border border-blue-600 text-blue-600 rounded-xl
                           hover:bg-blue-50 flex items-center justify-center gap-2"
                >
                  <FiStar className="w-5 h-5" />
                  Write Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-4 w-full max-w-md">
            <Chat freelancerId={id} onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleAddReview}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        packageDetails={selectedPackage}
        freelancerId={id}
        onSubmit={handlePayment}
      />
    </div>
  
  );
}
