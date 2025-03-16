'use client'
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />,
  ssr: false // Prevent SSR issues
});

export default function Hire() {
  const router = useRouter();
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize filters from router.query once available
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    experience: 'any'
  });

  // Update filters when router.query becomes available
  useEffect(() => {
    if (router.isReady) {
      setFilters({
        search: router.query.search || '',
        category: router.query.category || 'all',
        experience: router.query.experience || 'any'
      });
    }
  }, [router.isReady, router.query]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'web', label: 'Web Development' },
    { id: 'mobile', label: 'Mobile Development' },
    { id: 'design', label: 'Design' },
    { id: 'writing', label: 'Writing' },
    { id: 'marketing', label: 'Digital Marketing' },
    { id: 'video', label: 'Video & Animation' },
    { id: 'music', label: 'Music & Audio' },
    { id: 'data', label: 'Data Science' }
  ];

  useEffect(() => {
    if (router.isReady) {
      fetchFreelancers();
    }
  }, [filters, router.isReady]);

  const fetchFreelancers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`/api/freelancers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch freelancers');
      }

      const data = await response.json();
      setFreelancers(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to load freelancers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL query params
    router.push({
      pathname: router.pathname,
      query: Object.fromEntries(
        Object.entries(newFilters).filter(([_, v]) => v && v !== 'all' && v !== 'any')
      )
    }, undefined, { shallow: true });
  };

  const viewProfile = (freelancerId) => {
    if (!freelancerId) {
      console.error('Invalid freelancer ID');
      return;
    }
    router.push(`/freelancer/${freelancerId}`);
  };

  const NoFreelancers = () => (
    <div className="text-center py-20">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="w-32 h-32 mx-auto mb-4">
            <Image
              src="/empty-state.svg"
              alt="No results"
              width={128}
              height={128}
              className="w-full h-full"
            />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No Freelancers Found
          </h3>
          <p className="text-gray-600">
            We couldn't find any freelancers matching your criteria. Try adjusting your filters or search term.
          </p>
        </div>
        <button
          onClick={() => {
            const resetFilters = { search: '', category: 'all', experience: 'any' };
            setFilters(resetFilters);
            router.push({
              pathname: router.pathname,
            }, undefined, { shallow: true });
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-2xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  const ErrorState = ({ message }) => (
    <div className="text-center py-12">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg inline-block">
        <p className="text-red-700 text-lg">{message}</p>
        <button
          onClick={fetchFreelancers}
          className="mt-4 text-blue-600 hover:underline"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <Suspense fallback={<LoadingState />}>
      <div className="min-h-screen bg-gray-50">
        <div className="relative z-10">
          <NavBar />
        </div>

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Hire Top Freelancers
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Find the perfect freelancer for your project from our talented community of professionals.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="grid md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Search skills or keywords..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="p-3 border rounded-xl"
                />
                
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="p-3 border rounded-xl appearance-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                {/* Category Pills */}
                <div className="md:col-span-4 flex flex-wrap gap-2 mt-4">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleFilterChange('category', cat.id)}
                      className={`px-4 py-2 rounded-full text-sm ${
                        filters.category === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Section */}
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} />
            ) : freelancers?.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freelancers.map((freelancer) => (
                  <div 
                    key={freelancer._id} 
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl 
                              transition-all duration-300 hover:-translate-y-1 cursor-pointer
                              border border-gray-100"
                    onClick={() => viewProfile(freelancer._id)}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative w-20 h-20">
                        <Image
                          src={freelancer.avatar || '/user.avif'}
                          alt={freelancer.name}
                          fill
                          className="rounded-2xl object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{freelancer.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{freelancer.role || 'Freelancer'}</p>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <StarIcon className="w-4 h-4" />
                          <span className="font-medium">{freelancer.rating || '0.0'}</span>
                          <span className="text-gray-400 text-sm">({freelancer.totalReviews || 0} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{freelancer.bio || 'No bio available'}</p>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {(freelancer.skills || []).slice(0, 3).map((skill, i) => (
                          <span key={i} className="bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {(freelancer.skills || []).length > 3 && (
                          <span className="text-gray-500 text-sm">
                            +{freelancer.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-blue-600 font-bold">${freelancer.hourlyRate || '0'}/hr</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFreelancer(freelancer);
                          }}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          Quick View
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <NoFreelancers />
            )}
          </div>
        </div>

        {/* Quick View Modal */}
        {selectedFreelancer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setSelectedFreelancer(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
              
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-24 h-24">
                  <Image
                    src={selectedFreelancer.avatar || '/user.avif'}
                    alt={selectedFreelancer.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="(max-width: 96px) 100vw, 96px"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedFreelancer.name}</h2>
                  <p className="text-gray-600">{selectedFreelancer.role}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold">{selectedFreelancer.rating || '0.0'}</span>
                  </div>
                </div>
              </div>

             
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">
                  ${selectedFreelancer.hourlyRate || '10'}
                </p>
                <p className="text-gray-600 text-sm">Hourly Rate</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {selectedFreelancer.totalProjects || '0'}
                </p>
                <p className="text-gray-600 text-sm">Projects</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {selectedFreelancer.successRate || '90%'}
                </p>
                <p className="text-gray-600 text-sm">Success Rate</p>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-600">{selectedFreelancer.bio || 'No bio available'}</p>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(selectedFreelancer.skills || []).map((skill, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  router.push(`/freelancer/${selectedFreelancer._id}`);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
              >
                View Full Profile
              </button>
              <button
                onClick={() => {
                  router.push(`/messages/${selectedFreelancer._id}`);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Contact Freelancer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
        </Suspense>
  );
}
