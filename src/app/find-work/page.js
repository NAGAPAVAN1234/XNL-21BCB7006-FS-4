'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />,
});

export default function FindWork() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ensure we are in a browser environment before accessing localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const response = await fetch(`/api/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error.message);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      fetchProjects();
    }
  }, [router]); // Depend on router instead of router.isReady

  const NoProjects = () => (
    <div className="text-center py-12">
      <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
        <p className="text-gray-600 mb-4">
          No projects available at the moment. Check back later!
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center text-red-600 py-4">{error}</div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6">
              {projects.map((project) => (
                <div key={project._id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${project.budget.minAmount}</p>
                      <p className="text-gray-600">Fixed Price</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NoProjects />
          )}
        </div>
      </div>
    </div>
  );
}
