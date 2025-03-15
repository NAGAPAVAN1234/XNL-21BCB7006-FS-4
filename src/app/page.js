'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // Change this line
import { FiSearch, FiTrendingUp, FiCode, FiPenTool, FiBarChart, FiCamera, FiMic, FiDatabase, FiSmartphone } from 'react-icons/fi';

// Lazy load components
const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />
});

const Features = dynamic(() => import('@/components/Features'), {
  loading: () => <Loading />
});

const Testimonials = dynamic(() => import('@/components/Testimonials'), {
  loading: () => <Loading />
});

const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <Loading />
});

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [experience, setExperience] = useState('any');
  const { user } = useAuth();
  const router = useRouter(); // Now using correct router

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or loading state
  }

  const handleCategoryClick = (categoryId) => {
    router.push(`/hire?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <NavBar />
      
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center bg-fixed" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-white space-y-8 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium">
                <span className="flex items-center gap-2">
                  <FiTrendingUp className="text-yellow-400" />
                  Trusted by over 100,000+ businesses worldwide
                </span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                Find Perfect <span className="text-yellow-400">Freelancers</span>
              </h1>
              <p className="text-xl opacity-90 leading-relaxed">
                Connect with top talent for your projects and bring your ideas to life with our trusted freelance community.
              </p>
            </div>

            {/* Right Column - Search Box */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl 
                          transform hover:scale-[1.02] transition-all duration-300 
                          border border-white/20 animate-fade-in animation-delay-150">
              <div className="space-y-6">
                <h2 className="text-white text-2xl font-semibold mb-6">Find Talent</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white/80 backdrop-blur-sm border-0 
                             focus:ring-2 focus:ring-blue-400 transition-all duration-300
                             placeholder-gray-500 text-gray-800"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white/80 backdrop-blur-sm border-0 
                                   focus:ring-2 focus:ring-blue-400 transition-all duration-300
                                   text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile Development</option>
                    <option value="design">Design</option>
                    <option value="writing">Writing</option>
                  </select>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white/80 backdrop-blur-sm border-0 
                                   focus:ring-2 focus:ring-blue-400 transition-all duration-300
                                   text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="any">Any Experience Level</option>
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                  <Link 
                    href={`/hire?search=${searchTerm}&category=${category}&experience=${experience}`}
                    className="w-full p-4 rounded-xl bg-blue-500 hover:bg-blue-600 
                                   transition-all duration-300 flex items-center justify-center 
                                   text-white font-medium shadow-lg hover:shadow-blue-500/50"
                  >
                    <FiSearch className="mr-2" /> Search Freelancers
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - Overlapping Cards */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} 
                     className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl 
                               transition-all duration-300 transform hover:-translate-y-1
                               border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                                   bg-clip-text text-transparent">{stat.value}</span>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spacing div for content after stats */}
      <div className="h-32 md:h-40"></div>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Popular Categories
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Explore our most in-demand services and find the perfect match for your project
          </p>
          
          <div className="flex overflow-x-auto gap-6 pb-6 -mx-4 px-4 scroll-smooth hide-scrollbar">
            {categories.map((category) => (
              <div 
                key={category._id || category.id} // Use _id as fallback for id
                onClick={() => handleCategoryClick(category.id)}
                className="flex-none w-72 group cursor-pointer"
              >
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl 
                            transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center 
                               text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{category.title}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 font-medium">
                      {category.jobCount}+ Jobs
                    </span>
                    <span className="text-sm text-gray-500">
                      From ${category.startingPrice}/hr
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Static Components */}
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
}

const stats = [
  { value: "50K+", label: "Freelancers" },
  { value: "100K+", label: "Completed Projects" },
  { value: "95%", label: "Client Satisfaction" }
];

const categories = [
  {
    id: 'web',
    icon: <FiCode className="w-6 h-6" />,
    title: "Web Development",
    description: "Full-stack, frontend, and backend development",
    jobCount: "1.2K",
    startingPrice: "25"
  },
  {
    id: 'mobile',
    icon: <FiSmartphone className="w-6 h-6" />,
    title: "Mobile Development",
    description: "iOS, Android, and cross-platform development",
    jobCount: "800",
    startingPrice: "30"
  },
  {
    id: 'design',
    icon: <FiPenTool className="w-6 h-6" />,
    title: "Design & Creative",
    description: "UI/UX, graphic design, and branding",
    jobCount: "850",
    startingPrice: "20"
  },
  {
    id: 'marketing',  // Added missing id
    icon: <FiBarChart className="w-6 h-6" />,
    title: "Digital Marketing",
    description: "SEO, social media, and content marketing",
    jobCount: "750",
    startingPrice: "15"
  },
  {
    id: 'video',  // Added missing id
    icon: <FiCamera className="w-6 h-6" />,
    title: "Video & Animation",
    description: "Video editing, motion graphics, and 3D",
    jobCount: "500",
    startingPrice: "30"
  },
  {
    id: 'audio',  // Added missing id
    icon: <FiMic className="w-6 h-6" />,
    title: "Music & Audio",
    description: "Voice over, mixing, and production",
    jobCount: "300",
    startingPrice: "20"
  },
  {
    id: 'data',  // Added missing id
    icon: <FiDatabase className="w-6 h-6" />,
    title: "Data Science",
    description: "Analysis, machine learning, and AI",
    jobCount: "450",
    startingPrice: "35"
  }
];


