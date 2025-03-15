'use client'
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiFilter } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';
import { Suspense } from 'react'; // Import Suspense

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />
});

export default function FindWork() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState([]);  // Keep this as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // Add error state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    budget: searchParams.get('budget') || 'all'
  });

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
      fetchProjects();
  }, [filters]);


  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error before fetching
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/projects/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();

      // Ensure data is an array
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message);
      setProjects([]); // Reset projects on error
    } finally {
      setLoading(false);
    }
  };

    // Add No Projects Found component
    const NoProjects = () => (
      <div className="text-center py-12">
        <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search terms to find more projects.
          </p>
          <button
            onClick={() => setFilters({
              search: '',
              category: 'all',
              budget: 'all'
            })}
            className="text-blue-600 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      </div>
    );


  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="p-3 border rounded-xl"
                />
                
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="p-3 border rounded-xl"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
                
                <select
                  value={filters.budget}
                  onChange={(e) => setFilters(prev => ({ ...prev, budget: e.target.value }))}
                  className="p-3 border rounded-xl"
                >
                  <option value="all">All Budgets</option>
                  <option value="low">$0 - $500</option>
                  <option value="medium">$500 - $2000</option>
                  <option value="high">$2000+</option>
                </select>
              </div >

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
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

            {/* Projects List */}
            {loading ? (
              <Loading />
            ) : error ? (
              <div className="text-center text-red-600 py-4">{error}</div>
            ) : projects.length > 0 ? (
              <div className="grid gap-6">
                {projects.map(project => (
                  <div key={project._id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    {/* Project card content */}
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
    </Suspense>
  );
}
