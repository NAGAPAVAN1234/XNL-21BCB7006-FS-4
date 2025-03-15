'use client'
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { use } from 'react';
import Loading from '@/components/Loading';
import { FiBriefcase, FiClock, FiDollarSign, FiStar, FiCheckCircle } from 'react-icons/fi';
import JobApplicationForm from '@/components/JobApplicationForm';

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />
});

export default function JobDetails({ params }) {
  const id = use(params).id;  // Properly unwrap params using React.use()
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        
        // Ensure all required properties exist
        setJob({
          ...data,
          requirements: data.requirements || [],
          benefits: data.benefits || [],
          client: data.client || {},
          skills: data.skills || [],
          proposals: Array.isArray(data.proposals) ? data.proposals.length : 0
        });
      } catch (error) {
        console.error('Error fetching job:', error);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 text-center">{error}</div>;
  if (!job) return null;

  // Add default values to prevent undefined errors
  const jobData = {
    ...job,
    requirements: job.requirements || [],
    benefits: job.benefits || [],
    skills: job.skills || [],
    client: job.client || {},
    duration: job.duration || 'Not specified',
    budget: job.budget || { range: 'Not specified' }
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Budget not specified';
    return `${budget.type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}: ${budget.range}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {jobData.category}
                    </span>
                    <h1 className="text-3xl font-bold mt-2">{jobData.title}</h1>
                    <p className="text-gray-600 mt-2">
                      Posted {new Date(jobData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">
                      {formatBudget(jobData.budget)}
                    </p>
                  </div>
                </div>

                <div className="prose max-w-none mb-8">
                  <p className="text-gray-700 whitespace-pre-line">{jobData.detailedDescription}</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-4">Required Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {jobData.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {jobData.requirements.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Requirements</h2>
                      <ul className="space-y-2">
                        {jobData.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <FiCheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {jobData.benefits.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Benefits</h2>
                      <ul className="space-y-2">
                        {jobData.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <FiStar className="w-5 h-5 text-yellow-500 mt-1 mr-2" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 mb-6"
                >
                  Apply Now
                </button>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold mb-2">About the Client</h3>
                    <div className="space-y-2">
                      <p className="flex items-center">
                        <FiStar className="w-4 h-4 text-yellow-500 mr-2" />
                        {jobData.client.rating} Rating
                      </p>
                      <p className="flex items-center">
                        <FiBriefcase className="w-4 h-4 text-gray-400 mr-2" />
                        {jobData.client.totalHires} Total Hires
                      </p>
                      <p className="flex items-center">
                        <FiClock className="w-4 h-4 text-gray-400 mr-2" />
                        {jobData.client.activeProjects} Active Projects
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-bold mb-2">Job Details</h3>
                    <div className="space-y-2">
                      <p className="flex items-center">
                        <FiClock className="w-4 h-4 text-gray-400 mr-2" />
                        {jobData.duration}
                      </p>
                      <p className="flex items-center">
                        <FiDollarSign className="w-4 h-4 text-gray-400 mr-2" />
                        {jobData.proposals} Proposals
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Form Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Apply for {jobData.title}</h2>
            <JobApplicationForm jobId={id} onClose={() => setShowApplyForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
