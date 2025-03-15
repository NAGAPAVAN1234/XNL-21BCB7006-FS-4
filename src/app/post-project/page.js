'use client'
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loading from '@/components/Loading';
import { FiDollarSign, FiClock, FiPlus, FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';  // Change this line

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />
});

export default function PostProject() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    skills: [],
    budget: {
      type: 'fixed', // or 'hourly'
      minAmount: '',
      maxAmount: ''
    },
    duration: '',
    experienceLevel: '',
    attachments: []
  });

  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user) {
        router.push('/login');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          client: user._id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to create project');
      }

      // Success - redirect to the new project page
      router.push(`/jobs/${data._id}`);
    } catch (error) {
      console.error('Error:', error);
      // Show error message to user
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<Loading />}>
        <NavBar />
      </Suspense>

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Post a Project
          </h1>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter a title for your project"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  required
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="design">Design</option>
                  <option value="writing">Writing</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <textarea
                  required
                  className="w-full h-40 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                  placeholder="Describe your project in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                    placeholder="Add required skills"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    <FiPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <FiX />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Budget Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-600"
                      name="budgetType"
                      checked={formData.budget.type === 'fixed'}
                      onChange={() => setFormData({
                        ...formData,
                        budget: { ...formData.budget, type: 'fixed' }
                      })}
                    />
                    <span className="ml-2">Fixed Price</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-600"
                      name="budgetType"
                      checked={formData.budget.type === 'hourly'}
                      onChange={() => setFormData({
                        ...formData,
                        budget: { ...formData.budget, type: 'hourly' }
                      })}
                    />
                    <span className="ml-2">Hourly Rate</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                      placeholder="Min Amount"
                      value={formData.budget.minAmount}
                      onChange={(e) => setFormData({
                        ...formData,
                        budget: { ...formData.budget, minAmount: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                      placeholder="Max Amount"
                      value={formData.budget.maxAmount}
                      onChange={(e) => setFormData({
                        ...formData,
                        budget: { ...formData.budget, maxAmount: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Project Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Duration
                </label>
                <select
                  required
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                >
                  <option value="">Select duration</option>
                  <option value="less-than-1-month">Less than 1 month</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="more-than-6-months">More than 6 months</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Experience Level
                </label>
                <select
                  required
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                >
                  <option value="">Select experience level</option>
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert Level</option>
                </select>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                  onChange={(e) => setFormData({ ...formData, attachments: e.target.files })}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                           transition-colors duration-300 flex items-center gap-2"
                >
                  Post Project
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
