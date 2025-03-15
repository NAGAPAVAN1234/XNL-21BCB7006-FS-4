'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { FiEdit2, FiPlus, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />
});

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

const defaultProjectImage = '/images/default-project.jpg';

export default function Profile() {
  const initialFormData = {
    name: '',
    role: '',
    category: '',  // Keep both role and category
    hourlyRate: 0,
    totalProjects: 0,
    successRate: '0%',
    onTimeDelivery: '0%',
    location: '',
    languages: [], // Initialize empty array
    bio: '',
    skills: [],
    portfolio: [],
    reviews: [],
    packages: [],
    socialLinks: {
      website: '',
      linkedin: '',
      github: '',
      twitter: ''
    }
  };

  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState('basic');
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '', description: '', projectUrl: '', technologies: []
  });
  const [newPackage, setNewPackage] = useState({
    name: '', price: 0, deliveryTime: '', features: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/freelancers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Merge fetched data with initial form data to ensure all fields exist
      const formattedData = {
        ...initialFormData,
        ...data,
        languages: data.languages || [],
        skills: data.skills || [],
        portfolio: data.portfolio || [],
        packages: data.packages || [],
        socialLinks: {
          ...initialFormData.socialLinks,
          ...(data.socialLinks || {})
        }
      };
      
      setProfile(formattedData);
      setEditedData(formattedData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/freelancers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editedData)
      });

      if (response.ok) {
        setProfile(editedData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBasicInfoChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePortfolioAdd = async () => {
    if (!newPortfolioItem.title || !newPortfolioItem.projectUrl) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const updatedPortfolio = [
        ...(editedData.portfolio || []),
        {
          ...newPortfolioItem,
          image: defaultProjectImage,
          createdAt: new Date()
        }
      ];

      const token = localStorage.getItem('token');
      const response = await fetch('/api/freelancers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          portfolio: updatedPortfolio
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update portfolio');
      }

      setEditedData(prev => ({
        ...prev,
        portfolio: updatedPortfolio
      }));
      setNewPortfolioItem({
        title: '', description: '', projectUrl: '', technologies: []
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add portfolio item');
    }
  };

  const handlePackageAdd = () => {
    if (newPackage.name && newPackage.price) {
      setEditedData(prev => ({
        ...prev,
        packages: [...(prev.packages || []), newPackage]
      }));
      setNewPackage({ name: '', price: 0, deliveryTime: '', features: [] });
    }
  };

  const handleSkillAdd = (skill) => {
    if (skill && !editedData.skills?.includes(skill)) {
      setEditedData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill]
      }));
    }
  };

  const handleLanguageAdd = (language) => {
    if (!editedData.languages.includes(language)) {
      setEditedData(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {/* Profile Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  <FiEdit2 /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    <FiSave /> Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedData(profile);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg"
                  >
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Profile Navigation */}
            <div className="flex gap-4 mb-8 border-b">
              {['basic', 'portfolio', 'packages', 'skills'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 -mb-px ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editedData.name}
                      onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border rounded-lg"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Role
                    </label>
                    <input
                      type="text"
                      value={editedData.role}
                      onChange={(e) => handleBasicInfoChange('role', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border rounded-lg"
                      placeholder="freelancer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editedData.location}
                      onChange={(e) => handleBasicInfoChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border rounded-lg"
                      placeholder="New York, USA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      value={editedData.hourlyRate}
                      onChange={(e) => handleBasicInfoChange('hourlyRate', Number(e.target.value))}
                      disabled={!isEditing}
                      className="w-full p-3 border rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Success Rate
                    </label>
                    <input
                      type="text"
                      value={editedData.successRate}
                      onChange={(e) => handleBasicInfoChange('successRate', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border rounded-lg"
                      placeholder="98%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      On-Time Delivery
                    </label>
                    <input
                      type="text"
                      value={editedData.onTimeDelivery}
                      onChange={(e) => handleBasicInfoChange('onTimeDelivery', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border rounded-lg"
                      placeholder="100%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={editedData.category}
                      onChange={(e) => handleBasicInfoChange('category', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">Select Category</option>
                      <option value="web">Web Development</option>
                      <option value="mobile">Mobile Development</option>
                      <option value="design">Design</option>
                      <option value="writing">Writing</option>
                      <option value="marketing">Digital Marketing</option>
                      <option value="video">Video & Animation</option>
                      <option value="music">Music & Audio</option>
                      <option value="data">Data Science</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editedData.bio}
                      onChange={(e) => handleBasicInfoChange('bio', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border rounded-lg"
                      rows={4}
                      placeholder="Experienced full-stack developer specializing in..."
                    />
                  </div>
                </div>

                {/* Languages Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Languages</h3>
                  {isEditing && (
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Add a language"
                        className="flex-1 p-3 border rounded-lg"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            handleLanguageAdd(e.target.value.trim());
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add a language"]');
                          if (input.value.trim()) {
                            handleLanguageAdd(input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        Add Language
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(editedData.languages || []).map((lang, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {lang}
                        {isEditing && (
                          <FiX
                            className="cursor-pointer"
                            onClick={() => {
                              setEditedData(prev => ({
                                ...prev,
                                languages: prev.languages.filter((_, i) => i !== index)
                              }));
                            }}
                          />
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Social Links</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['website', 'linkedin', 'github', 'twitter'].map((platform) => (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </label>
                        <input
                          type="url"
                          value={editedData.socialLinks?.[platform] || ''}
                          onChange={(e) => handleInputChange('socialLinks', {
                            ...editedData.socialLinks,
                            [platform]: e.target.value
                          })}
                          disabled={!isEditing}
                          className="w-full p-3 border rounded-lg"
                          placeholder={`Enter your ${platform} URL`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                {isEditing && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add a skill"
                      className="flex-1 p-3 border rounded-lg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSkillAdd(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                      onClick={() => {
                        const input = document.querySelector('input');
                        handleSkillAdd(input.value);
                        input.value = '';
                      }}
                    >
                      Add Skill
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {(editedData.skills || []).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {skill}
                      {isEditing && (
                        <FiX
                          className="cursor-pointer"
                          onClick={() => {
                            setEditedData(prev => ({
                              ...prev,
                              skills: prev.skills.filter((_, i) => i !== index)
                            }));
                          }}
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                {isEditing && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg mb-4">
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={newPortfolioItem.title}
                      onChange={(e) => setNewPortfolioItem(prev => ({
                        ...prev,
                        title: e.target.value
                      }))}
                      className="p-3 border rounded-lg"
                    />
                    <input
                      type="url"
                      placeholder="Project URL"
                      value={newPortfolioItem.projectUrl}
                      onChange={(e) => setNewPortfolioItem(prev => ({
                        ...prev,
                        projectUrl: e.target.value
                      }))}
                      className="p-3 border rounded-lg"
                    />
                    <textarea
                      placeholder="Description"
                      value={newPortfolioItem.description}
                      onChange={(e) => setNewPortfolioItem(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      className="p-3 border rounded-lg col-span-2"
                    />
                    <button
                      onClick={handlePortfolioAdd}
                      disabled={!newPortfolioItem.title || !newPortfolioItem.projectUrl}
                      className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                    >
                      Add Portfolio Item
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-6">
                  {(editedData.portfolio || []).map((item, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                        <Image
                          src={defaultProjectImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                          priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <h3 className="text-white font-bold">{item.title}</h3>
                          <p className="text-white/80 text-sm mb-2">{item.description}</p>
                          <a 
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            View Project →
                          </a>
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => {
                            setEditedData(prev => ({
                              ...prev,
                              portfolio: prev.portfolio.filter((_, i) => i !== index)
                            }));
                          }}
                          className="absolute top-2 right-2 text-white bg-red-500 rounded-full p-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packages Tab */}
            {activeTab === 'packages' && (
              <div className="space-y-6">
                {isEditing && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg mb-4">
                    <input
                      type="text"
                      placeholder="Package Name"
                      value={newPackage.name}
                      onChange={(e) => setNewPackage(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="p-3 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={newPackage.price}
                      onChange={(e) => setNewPackage(prev => ({
                        ...prev,
                        price: e.target.value
                      }))}
                      className="p-3 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Delivery Time"
                      value={newPackage.deliveryTime}
                      onChange={(e) => setNewPackage(prev => ({
                        ...prev,
                        deliveryTime: e.target.value
                      }))}
                      className="p-3 border rounded-lg"
                    />
                    <button
                      onClick={handlePackageAdd}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Add Package
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-6">
                  {(editedData.packages || []).map((pkg, index) => (
                    <div key={index} className="border rounded-xl p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-xl">{pkg.name}</h3>
                        {isEditing && (
                          <button
                            onClick={() => {
                              setEditedData(prev => ({
                                ...prev,
                                packages: prev.packages.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-500"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-blue-600 my-4">
                        ${pkg.price}
                      </p>
                      <p className="text-gray-600">
                        Delivery in {pkg.deliveryTime}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
